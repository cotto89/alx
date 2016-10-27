import merge = require("lodash.merge");

export type Chain = {
    (payload: any, getStatus: Function, dispach: Function): any;
}

export type UseCaseOptions<TStatus, TPayload> = {
    id?: string;
    action?: (...args: any[]) => any;
    reducer?: (status: TStatus, payload: TPayload) => TStatus;
    reducers?: {
        [context: string]: (state: TStatus, payload: TPayload) => Object;
    };
    chain?: Chain | Chain[];
}

export class UseCase<TStatus, TPayload> {

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
    static clone<TStatus, TPayload>(
        usecase: UseCase<TStatus, TPayload>,
        ...options: UseCaseOptions<TStatus, TPayload>[]
    ): UseCase<TStatus, TPayload> {
        return merge(new UseCase<TStatus, TPayload>(), {}, usecase, ...options);
    }

    id: string | undefined;
    action: (...args: any[]) => any;
    reducer?: ((status: TStatus, payload: TPayload) => TStatus);
    reducers?: {
        [context: string]: (state: Object, payload: TPayload) => Object
    };
    chain: Chain[];

    /**
     * Creates an instance of UseCase.
     *
     * @param {(string | UseCaseOptions<TStatus, TPayload>)} [id]
     * @param {UseCaseOptions<TStatus, TPayload>} [options={}]
     *
     * @memberOf UseCase
     */
    constructor(id?: string | UseCaseOptions<TStatus, TPayload>, options: UseCaseOptions<TStatus, TPayload> = {}) {
        const $id = typeof id === "string" ? id : undefined;
        const $options = $id ? options : (id as UseCaseOptions<TStatus, TPayload>) || {};

        const { action, reducer, reducers, chain } = $options;

        this.id = $id || $options.id;
        this.action = action || function defaultAction() {
            return undefined;
        };

        this.reducer = reducer;
        this.reducers = reducers;
        this.chain = (() => {
            if (typeof chain === "function") { return [chain]; };
            if (Array.isArray(chain)) { return chain; };
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
    exec<TActionArgs>(actionArgs?: TActionArgs): Promise<{ payload: TPayload; usecase: UseCase<TStatus, TPayload> }> {
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
    reduce(status: TStatus, payload: TPayload): TStatus {
        type IStatus = { [context: string]: any }

        const { reducer, reducers } = this;

        const nextStatus: IStatus = {};
        const preNextStatus: IStatus = reducer ? reducer(status, payload) : status;

        if (!reducers) { return (preNextStatus as TStatus); }

        Object.keys(preNextStatus).forEach((ctx: string) => {
            if (reducers[ctx]) {
                nextStatus[ctx] = reducers[ctx]((status as IStatus), payload);
            } else {
                nextStatus[ctx] = preNextStatus[ctx];
            }
        });

        return (nextStatus as TStatus);
    }

    /**
     * Attach chain to target usecase
     *
     * @param {...Chain[]} chain
     * @returns {UseCase<TStatus, TPayload>}
     *
     * @memberOf UseCase
     */
    link(...chain: Chain[]): UseCase<TStatus, TPayload> {
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
    next(payload: TPayload, getStatus: Function, dispach: Function): void {
        if (this.chain.length < 1) { return; };

        const gens = [...this.chain];

        function handleGen(generator?: Function): void {
            if (!generator || typeof generator !== "function") { return; }

            const g = generator(payload, getStatus, dispach);

            if (!g || !g.next || typeof g.next !== "function") { return handleGen(gens.shift()); }

            (function exec(val?: any) {
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
