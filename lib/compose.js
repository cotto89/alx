const isPlainObject = require('lodash.isplainobject');
/**
 * Compose action and reducer
 *
 * @param {string} [type]
 * @param {Object} options
 * @param {Function} options.action
 * @param {Function} [options.reducer]
 * @param {Function} [options.next]
 * @param {Object} [options.reducers]
 *
 * @returns {Function} component
 */
function compose(type, options) {
    const $type = typeof type === 'string' ? type : undefined;
    const $options = $type ? options : type;

    const { action, reducer, reducers, next } = $options;

    /**
     * @param {any} actionArgs
     * @returns {Object} { reduce, next, payload }
     */
    function component(...actionArgs) {
        return action && Promise.resolve(action(...actionArgs))
            .then((payload) => {
                /* type of payload should be PlainObject */
                if (!isPlainObject(payload)) {
                    return Promise.reject(
                        new Error(`Action return ${payload} as payload. ` +
                            'Payload must be PlainObject.')
                    );
                }

                payload.$type = $type;

                /**
                 * @param {Object} status
                 * @returns {Object} nextStatus
                 */
                function reduce(status) {
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

                return { reduce, next, payload };
            });
    }

    component.raw = () => Object.assign({}, $options);
    component.$type = $type;

    return component;
}

module.exports = compose;
