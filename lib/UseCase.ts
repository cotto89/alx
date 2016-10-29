import merge = require("lodash.merge");

export type Chain<TPayload> = {
    ({payload, getStatus, dispatch }: {
        payload: TPayload,
        getStatus: Function,
        dispatch: Function
    }): any;
}

/**
 * @export
 * @interface UseCaseOptions
 * @template TStatus
 * @template TPayload
 */
export interface UseCaseOptions<TStatus, TPayload> {
    id?: string;
    action?: (...args: any[]) => any;
    reducer?: (status: TStatus, payload: TPayload) => TStatus;
    reducers?: {
        [context: string]: (state: any, payload: TPayload) => any;
    };
    chain?: Chain<TPayload> | Chain<TPayload>[];
}

export type ComposeOptions<TStatus, TPayload> =
    ((usecase: UseCaseOptions<TStatus, TPayload>) => void)
    | UseCaseOptions<TStatus, TPayload>

export interface Compound<TStatus, TPayload, TActionArgs> {
    (actionArgs?: TActionArgs): Promise<{ payload: TPayload, usecase: UseCase<TStatus, TPayload> }>;
    usecase: UseCase<TStatus, TPayload>;
}

/**
 * @export
 * @class UseCase
 * @template TStatus
 * @template TPayload
 */
export class UseCase<TStatus, TPayload> {

    static initialize: <TStatus>() => ({
        compose: <TActionArgs, TPayload>(
            options?: ComposeOptions<TStatus, TPayload>
        ) => Compound<TStatus, TPayload, TActionArgs>;

        link: <TActionArgs, TPayload>(
            compound: Compound<TStatus, TPayload, TActionArgs>,
            ...chain: Chain<TPayload>[]
        ) => Compound<TStatus, TPayload, TActionArgs>;

        clone: <TActionArgs, TPayload>(
            compound: Compound<TStatus, TPayload, TActionArgs>,
            ...options: UseCaseOptions<TStatus, TPayload>[]
        ) => Compound<TStatus, TPayload, TActionArgs>;
    });

    id: string | undefined;
    action: (...args: any[]) => any;
    reducer?: ((status: TStatus, payload: TPayload) => TStatus);
    /*
     * ここの型定義をもっと厳密にやりたい
     * ジェネリクスやアサーションでstateの仮引数に型を付けると、
     * payloadのジェネリクスで付けている型が暗黙のany型になってしまう
     *
     * 以下のようにstateをキャストさせて型付けするのがいまのところのベターな選択
     * u.reducers = {
     *     counter: (state, payload) => ({
     *         count: (state as CounterState).count + payload.count,
     *      }),
     * };
     *
     */
    reducers?: {
        [context: string]: (state: any, payload: TPayload) => any
    };
    chain: Chain<TPayload>[];

    /**
     * Creates an instance of UseCase.
     *
     * @param {UseCaseOptions<TStatus, TPayload>} [options={}]
     *
     * @memberOf UseCase
     */
    constructor(options: UseCaseOptions<TStatus, TPayload> = {}) {
        const { id, action, reducer, reducers, chain } = options;

        this.id = id;
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
        type Status = { [context: string]: any }

        const { reducer, reducers } = this;

        const currentStatus: Status = status;
        const nextStatus: Status = {};
        const preNextStatus: Status = reducer ? reducer(currentStatus as TStatus, payload) : status;

        if (!reducers) { return (preNextStatus as TStatus); }

        Object.keys(preNextStatus).forEach((ctx: string) => {
            if (reducers[ctx]) {
                nextStatus[ctx] = reducers[ctx](currentStatus[ctx], payload);
            } else {
                nextStatus[ctx] = preNextStatus[ctx];
            }
        });

        return (nextStatus as TStatus);
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
    next(payload: TPayload, getStatus: Function, dispatch: Function): void {
        if (this.chain.length < 1) { return; };

        const gens = [...this.chain];

        function handleGen(generator?: Function): void {
            if (!generator || typeof generator !== "function") { return; }

            const g = generator({ payload, getStatus, dispatch });

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
UseCase.initialize = function initialize<TStatus>() {
    /**
     * Attach chain function(s) to target usecase
     *
     * @template TPayload
     * @template TActionArgs
     * @param {Compound<TStatus, TPayload, TActionArgs>} compound
     * @param {...Chain<TPayload>[]} chain
     * @returns
     */
    function link<TActionArgs, TPayload>(
        compound: Compound<TStatus, TPayload, TActionArgs>,
        ...chain: Chain<TPayload>[]
    ) {
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
    function clone<TActionArgs, TPayload>(
        compound: Compound<TStatus, TPayload, TActionArgs>,
        ...options: UseCaseOptions<TStatus, TPayload>[]
    ) {
        const $options = merge(new UseCase<TStatus, TPayload>(), {}, compound.usecase, ...options);
        return compose<TActionArgs, TPayload>($options);
    }

    /**
     * Compose usecase
     *
     * @template TPayload
     * @template TActionArgs
     * @param {Options<TStatus, TPayload>} [options]
     * @returns {Compound<TStatus, TPayload, TActionArgs>}
     */
    function compose<TActionArgs, TPayload>(options?: ComposeOptions<TStatus, TPayload>
    ): Compound<TStatus, TPayload, TActionArgs> {
        let finalOptions: UseCaseOptions<TStatus, TPayload> = {};

        if (typeof options === "object") {
            finalOptions = options;
        }

        if (typeof options === "function") {
            options(finalOptions);
        }

        let instance = new UseCase(finalOptions);

        let f: any = function execAction(actionArgs?: TActionArgs) {
            return instance.exec(actionArgs);
        };

        f.usecase = instance;

        let compound: Compound<TStatus, TPayload, TActionArgs> = f;
        return compound;
    }

    return { compose, link, clone };
};
