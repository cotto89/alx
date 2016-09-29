/**
 * Generate NextStatus
 *
 * @param {Object} status
 * @param {Object} action
 * @param {Object} planInfo
 * @returns {Object} nextStatus
 */
function generateNextStatus(currentStatus, action, planInfo) {
    const { order } = planInfo;
    const nextStatus = {};

    /* execute transformer */
    for (const [ctx, transformer] of order) {
        const state = currentStatus[ctx];

        if (!transformer) {
            nextStatus[ctx] = currentStatus[ctx];
            continue;
        }

        if (state) {
            try {
                nextStatus[ctx] = transformer(state, action, currentStatus, nextStatus);
            } catch (error) {
                console.error(error);
                nextStatus[ctx] = currentStatus[ctx];
            }

            continue;
        }

        /* mixed context transformer */
        if (!state) {
            try {
                /*
                 you shuold return 'status' for update context state,
                 when you use mixed context transformer.
                */
                const $nextStatus = transformer(state, action, currentStatus, nextStatus);
                Object.keys($nextStatus).forEach(($ctx) => {
                    nextStatus[$ctx] = $nextStatus[$ctx];
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    return nextStatus;
}

module.exports = generateNextStatus;
