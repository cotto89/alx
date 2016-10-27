"use strict";
const merge = require("lodash.merge");
class UseCase {
    /**
     * Creates an instance of UseCase.
     *
     * @param {(string | UseCaseOptions<TStatus, TPayload>)} [id]
     * @param {UseCaseOptions<TStatus, TPayload>} [options={}]
     *
     * @memberOf UseCase
     */
    constructor(id, options = {}) {
        const $id = typeof id === "string" ? id : undefined;
        const $options = $id ? options : id || {};
        const { action, reducer, reducers, chain } = $options;
        this.id = $id || $options.id;
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
     * Clone an instance of UseCase
     *
     * @static
     * @template TStatus
     * @template TPayload
     * @param {UseCase<TStatus, TPayload>} usecase
     * @param {...UseCaseOptions<TStatus, TPayload>[]} options
     * @returns {UseCase<TStatus, TPayload>}
     *
     * @memberOf UseCase
     */
    static clone(usecase, ...options) {
        return merge(new UseCase(), {}, usecase, ...options);
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
        const nextStatus = {};
        const preNextStatus = reducer ? reducer(status, payload) : status;
        if (!reducers) {
            return preNextStatus;
        }
        Object.keys(preNextStatus).forEach((ctx) => {
            if (reducers[ctx]) {
                nextStatus[ctx] = reducers[ctx](status, payload);
            }
            else {
                nextStatus[ctx] = preNextStatus[ctx];
            }
        });
        return nextStatus;
    }
    /**
     * Attach chain to target usecase
     *
     * @param {...Chain[]} chain
     * @returns {UseCase<TStatus, TPayload>}
     *
     * @memberOf UseCase
     */
    link(...chain) {
        return UseCase.clone(this, { chain: [...chain] });
    }
    /**
     * Execute chain
     *
     * @param {TPayload} payload
     * @param {Function} getStatus
     * @param {Function} dispach
     * @returns {void}
     *
     * @memberOf UseCase
     */
    next(payload, getStatus, dispach) {
        if (this.chain.length < 1) {
            return;
        }
        ;
        const gens = [...this.chain];
        function handleGen(generator) {
            if (!generator || typeof generator !== "function") {
                return;
            }
            const g = generator(payload, getStatus, dispach);
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
//# sourceMappingURL=UseCase.js.map