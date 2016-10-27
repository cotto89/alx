export declare type Chain = {
    (payload: any, getStatus: Function, dispach: Function): any;
};
export declare type UseCaseOptions<TStatus, TPayload> = {
    id?: string;
    action?: (...args: any[]) => any;
    reducer?: (status: TStatus, payload: TPayload) => TStatus;
    reducers?: {
        [context: string]: (state: TStatus, payload: TPayload) => Object;
    };
    chain?: Chain | Chain[];
};
export declare class UseCase<TStatus, TPayload> {
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
    static clone<TStatus, TPayload>(usecase: UseCase<TStatus, TPayload>, ...options: UseCaseOptions<TStatus, TPayload>[]): UseCase<TStatus, TPayload>;
    id: string | undefined;
    action: (...args: any[]) => any;
    reducer?: ((status: TStatus, payload: TPayload) => TStatus);
    reducers?: {
        [context: string]: (state: Object, payload: TPayload) => Object;
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
    constructor(id?: string | UseCaseOptions<TStatus, TPayload>, options?: UseCaseOptions<TStatus, TPayload>);
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
     * Attach chain to target usecase
     *
     * @param {...Chain[]} chain
     * @returns {UseCase<TStatus, TPayload>}
     *
     * @memberOf UseCase
     */
    link(...chain: Chain[]): UseCase<TStatus, TPayload>;
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
    next(payload: TPayload, getStatus: Function, dispach: Function): void;
}
