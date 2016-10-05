const isPlainObject = require('lodash.isplainobject');
const merge = require('lodash.merge');

const blankAction = () => ({});

class UseCase {
    /**
     * Creates an instance of UseCase.
     *
     * @static
     * @param {string} [type]
     * @param {Object} [options]
     * @param {Function} [options.action]
     * @param {Function} [options.reducer]
     * @param {Object} [options.reducers]
     * @param {Function[]} [options.chain]
     * @returns {UseCase} instance of UseCase
     */
    static compose(type, options) {
        return new UseCase(type, options);
    }

    /**
     * Clone usecase
     *
     * @static
     * @param {UseCase} usecase
     * @returns
     */
    static clone(usecase, ...options) {
        return merge(new UseCase(), {}, usecase, ...options);
    }


    /**
     * Creates an instance of UseCase.
     *
     * @static
     * @param {string} [type]
     * @param {Object} [options]
     * @param {Function} [options.action]
     * @param {Function} [options.reducer]
     * @param {Object} [options.reducers]
     * @param {Function[]} [options.chain]
     * @returns {UseCase} instance of UseCase
     */
    constructor(type, options = {}) {
        const $type = typeof type === 'string' ? type : undefined;
        const $options = $type ? options : type || {};
        const { action, reducer, reducers, chain } = $options;

        this.$type = $type;
        this.action = action || blankAction;
        this.reducer = reducer;
        this.reducers = reducers;
        this.chain = (() => {
            if (typeof chain === 'function') return [chain];
            if (Array.isArray(chain)) return chain;
            return [];
        })();
        this.payload = {};
    }

    /**
     * Execute action and set payload
     *
     * @param {any} [actionArgs]
     * @returns {Promise} usecase
     */
    exec(...actionArgs) {
        return Promise.resolve(this.action(...actionArgs))
            .then((payload) => {
                /* Type of payload must be PlainObject */
                if (!isPlainObject(payload)) {
                    return Promise.reject(
                        new Error(`Action return ${payload} as payload. ` +
                            'Payload must be PlainObject.')
                    );
                }

                this.payload = Object.assign({ $type: this.$type }, payload);
                return this;
            });
    }

    /**
     * Execute reducer(s)
     *
     * @param {Object} status
     * @returns nextStatus
     */
    reduce(status) {
        const { reducer, reducers, payload } = this;

        const nextStatus = {};
        const preNextStatus = reducer ? reducer(status, payload) : status;

        if (!reducers) return preNextStatus;

        Object.keys(preNextStatus).forEach((ctx) => {
            if (reducers[ctx]) {
                nextStatus[ctx] = reducers[ctx](status[ctx], payload);
            } else {
                nextStatus[ctx] = preNextStatus[ctx];
            }
        });

        return nextStatus;
    }


    /**
     * Add usecase.chain to cloned usecase
     *
     * @param {Function} chain
     * @returns {Usecase}
     */
    link(chain) {
        const clone = UseCase.clone(this);
        clone.chain = [...clone.chain, chain];
        return clone;
    }

    /**
     * Execure chain
     *
     * @param {Function} getStatus
     * @param {Function} emit
     */
    next(getStatus, emit) {
        if (this.chain.length < 1) return;

        const gens = [...this.chain];
        const payload = merge({}, this.payload);

        function handleGen(generator) {
            const g = generator(getStatus, emit, payload);

            (function exec(val) {
                const result = g.next(val);

                if (!result.done) {
                    Promise.resolve(result.value).then(v => exec(v));
                }

                if (result.done && gens.length > 0) {
                    handleGen(gens.shift());
                }
            }());
        }

        handleGen(gens.shift());
    }

}

module.exports = UseCase;
