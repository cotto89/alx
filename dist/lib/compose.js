"use strict";
const UseCase_1 = require("./UseCase");
const merge = require("lodash.merge");
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
function compose(id, options) {
    const usecase = new UseCase_1.UseCase(id, options);
    let f = function execAction(actionArgs) {
        return usecase.exec(actionArgs);
    };
    f.usecase = usecase;
    f.link = (...chain) => {
        const $options = merge({}, options, { chain: [...chain] });
        return compose(id, $options);
    };
    let compound = f;
    return compound;
}
exports.compose = compose;
//# sourceMappingURL=compose.js.map