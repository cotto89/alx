import { UseCase, UseCaseOptions, Chain } from "./UseCase";
export interface Compound<TStatus, TPayload, TActionArgs> {
    (actionArgs?: TActionArgs): Promise<{
        payload: any;
        usecase: UseCase<TStatus, TPayload>;
    }>;
    usecase: UseCase<TStatus, TPayload>;
    link: (...chain: Chain[]) => Compound<TStatus, TPayload, TActionArgs>;
}
/**
 * Compose UseCase
 *
 * @export
 * @template TStatus
 * @template TPayload
 * @template TActionArgs
 * @param {string} [id]
 * @param {UseCaseOptions<TStatus, TPayload>} [options]
 * @returns {Compound} Function
 */
export declare function compose<TStatus, TPayload, TActionArgs>(id?: string, options?: UseCaseOptions<TStatus, TPayload>): Compound<TStatus, TPayload, TActionArgs>;
