"use strict";
const merge = require("lodash.merge");
/**
 * @export
 * @class UseCase
 * @template TStatus
 * @template TPayload
 */
class UseCase {
    /**
     * Creates an instance of UseCase.
     *
     * @param {UseCaseOptions<TStatus, TPayload>} [options={}]
     *
     * @memberOf UseCase
     */
    constructor(options = {}) {
        const { id, action, reducer, reducers, chain } = options;
        this.id = id;
        this.action = action || function defaultAction() {
            return undefined;
        };
        this.reducer = reducer;
        this.reducers = reducers;
        this.chain = (() => {
            if (typeof chain === "function") {
                return [chain];
            }
            ;
            if (Array.isArray(chain)) {
                return chain;
            }
            ;
            return [];
        })();
    }
    /**
     * Execute Action
     *
     * @template TActionArgs
     * @param {TActionArgs} actionArgs
     * @returns {Promise<{ payload: TPayload, usecase: UseCase<TStatus, TPayload> }>}
     *
     * @memberOf UseCase.
     */
    exec(actionArgs) {
        return Promise.resolve(this.action(actionArgs))
            .then((payload) => ({
            payload,
            usecase: this,
        }));
    }
    /**
     * Execute reducer(s)
     *
     * @param {TStatus} status
     * @param {TPayload} payload
     * @returns {TStatus}
     *
     * @memberOf UseCase
     */
    reduce(status, payload) {
        const { reducer, reducers } = this;
        const currentStatus = status;
        const nextStatus = {};
        const preNextStatus = reducer ? reducer(currentStatus, payload) : status;
        if (!reducers) {
            return preNextStatus;
        }
        Object.keys(preNextStatus).forEach((ctx) => {
            if (reducers[ctx]) {
                nextStatus[ctx] = reducers[ctx](currentStatus[ctx], payload);
            }
            else {
                nextStatus[ctx] = preNextStatus[ctx];
            }
        });
        return nextStatus;
    }
    /**
     * Execute chain
     *
     * @param {TPayload} payload
     * @param {Function} getStatus
     * @param {Function} dispatch
     * @returns {void}
     *
     * @memberOf UseCase
     */
    next(payload, getStatus, dispatch) {
        if (this.chain.length < 1) {
            return;
        }
        ;
        const gens = [...this.chain];
        function handleGen(generator) {
            if (!generator || typeof generator !== "function") {
                return;
            }
            const g = generator({ payload, getStatus, dispatch });
            if (!g || !g.next || typeof g.next !== "function") {
                return handleGen(gens.shift());
            }
            (function exec(val) {
                const result = g.next(val);
                if (!result.done && !result.hasOwnProperty("value")) {
                    return handleGen(gens.shift());
                }
                if (!result.done) {
                    Promise.resolve(result.value).then((v) => exec(v));
                }
                if (result.done) {
                    handleGen(gens.shift());
                }
            })();
        }
        handleGen(gens.shift());
    }
}
exports.UseCase = UseCase;
/* ==============================
# static
=================================*/
/**
 * Create an utile function that Usecase wrapper
 *
 * @static
 * @template TStatus
 * @returns Function
 *
 * @memberOf UseCase
 */
UseCase.initialize = function initialize() {
    /**
     * Attach chain function(s) to target usecase
     *
     * @template TPayload
     * @template TActionArgs
     * @param {Compound<TStatus, TPayload, TActionArgs>} compound
     * @param {...Chain<TPayload>[]} chain
     * @returns
     */
    function link(compound, ...chain) {
        const $options = merge({}, compound.usecase, { chain: [...chain] });
        return compose($options);
    }
    /**
     * Clone usecase
     *
     * @template TPayload
     * @template TActionArgs
     * @param {Compound<TStatus, TPayload, TActionArgs>} compound
     * @param {...UseCaseOptions<TStatus, TPayload>[]} options
     * @returns
     */
    function clone(compound, ...options) {
        const $options = merge(new UseCase(), {}, compound.usecase, ...options);
        return compose($options);
    }
    /**
     * Compose usecase
     *
     * @template TPayload
     * @template TActionArgs
     * @param {Options<TStatus, TPayload>} [options]
     * @returns {Compound<TStatus, TPayload, TActionArgs>}
     */
    function compose(options) {
        let finalOptions = {};
        if (typeof options === "object") {
            finalOptions = options;
        }
        if (typeof options === "function") {
            options(finalOptions);
        }
        let instance = new UseCase(finalOptions);
        let f = function execAction(actionArgs) {
            return instance.exec(actionArgs);
        };
        f.usecase = instance;
        let compound = f;
        return compound;
    }
    return { compose, link, clone };
};
//# sourceMappingURL=UseCase.js.map