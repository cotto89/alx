export declare type Chain<TPayload> = {
    ({payload, getStatus, dispatch}: {
        payload: TPayload;
        getStatus: Function;
        dispatch: Function;
    }): any;
};
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
export declare type ComposeOptions<TStatus, TPayload> = ((usecase: UseCaseOptions<TStatus, TPayload>) => void) | UseCaseOptions<TStatus, TPayload>;
export interface Compound<TStatus, TPayload, TActionArgs> {
    (actionArgs?: TActionArgs): Promise<{
        payload: TPayload;
        usecase: UseCase<TStatus, TPayload>;
    }>;
    usecase: UseCase<TStatus, TPayload>;
}
/**
 * @export
 * @class UseCase
 * @template TStatus
 * @template TPayload
 */
export declare class UseCase<TStatus, TPayload> {
    static initialize: <TStatus>() => ({
        compose: <TActionArgs, TPayload>(options?: ComposeOptions<TStatus, TPayload>) => Compound<TStatus, TPayload, TActionArgs>;
        link: <TActionArgs, TPayload>(compound: Compound<TStatus, TPayload, TActionArgs>, ...chain: Chain<TPayload>[]) => Compound<TStatus, TPayload, TActionArgs>;
        clone: <TActionArgs, TPayload>(compound: Compound<TStatus, TPayload, TActionArgs>, ...options: UseCaseOptions<TStatus, TPayload>[]) => Compound<TStatus, TPayload, TActionArgs>;
    });
    id: string | undefined;
    action: (...args: any[]) => any;
    reducer?: ((status: TStatus, payload: TPayload) => TStatus);
    reducers?: {
        [context: string]: (state: any, payload: TPayload) => any;
    };
    chain: Chain<TPayload>[];
    /**
     * Creates an instance of UseCase.
     *
     * @param {UseCaseOptions<TStatus, TPayload>} [options={}]
     *
     * @memberOf UseCase
     */
    constructor(options?: UseCaseOptions<TStatus, TPayload>);
    /**
     * Execute Action
     *
     * @template TActionArgs
     * @param {TActionArgs} actionArgs
     * @returns {Promise<{ payload: TPayload, usecase: UseCase<TStatus, TPayload> }>}
     *
     * @memberOf UseCase.
     */
    exec<TActionArgs>(actionArgs?: TActionArgs): Promise<{
        payload: TPayload;
        usecase: UseCase<TStatus, TPayload>;
    }>;
    /**
     * Execute reducer(s)
     *
     * @param {TStatus} status
     * @param {TPayload} payload
     * @returns {TStatus}
     *
     * @memberOf UseCase
     */
    reduce(status: TStatus, payload: TPayload): TStatus;
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
    next(payload: TPayload, getStatus: Function, dispatch: Function): void;
}
