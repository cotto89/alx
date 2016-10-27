import { UseCase, IUseCaseOptions, IChain } from "./UseCase";
import merge = require("lodash.merge");

export interface IhandleUseCase<TStatus, TPayload, TActionArgs> {
    (actionArgs?: TActionArgs): Promise<{ payload: any, usecase: UseCase<TStatus, TPayload> }>;
    usecase: UseCase<TStatus, TPayload>;
    link: (...chain: IChain[]) => IhandleUseCase<TStatus, TPayload, TActionArgs>;
}

export function compose<TStatus, TPayload, TActionArgs>(
    id?: string,
    options?: IUseCaseOptions<TStatus, TPayload>
) {

    const usecase = new UseCase<TStatus, TPayload>(id, options);

    let f: any = function execAction(actionArgs?: TActionArgs) {
        return usecase.exec(actionArgs);
    };

    f.usecase = usecase;
    f.link = (...chain: IChain[]) => {
        const $options = merge({}, options, { chain: [...chain] });
        return compose<TStatus, TPayload, TActionArgs>(id, $options);
    };

    let handleUseCase: IhandleUseCase<TStatus, TPayload, TActionArgs> = f;
    return handleUseCase;
}
