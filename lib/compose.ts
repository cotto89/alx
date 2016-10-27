import { UseCase, UseCaseOptions, Chain } from "./UseCase";
import merge = require("lodash.merge");

export interface Compound<TStatus, TPayload, TActionArgs> {
    (actionArgs?: TActionArgs): Promise<{ payload: any, usecase: UseCase<TStatus, TPayload> }>;
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
export function compose<TStatus, TPayload, TActionArgs>(
    id?: string,
    options?: UseCaseOptions<TStatus, TPayload>
) {

    const usecase = new UseCase<TStatus, TPayload>(id, options);

    let f: any = function execAction(actionArgs?: TActionArgs) {
        return usecase.exec(actionArgs);
    };

    f.usecase = usecase;
    f.link = (...chain: Chain[]) => {
        const $options = merge({}, options, { chain: [...chain] });
        return compose<TStatus, TPayload, TActionArgs>(id, $options);
    };

    let compound: Compound<TStatus, TPayload, TActionArgs> = f;
    return compound;
}
