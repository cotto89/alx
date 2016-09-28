const EventEmitter = require('events');
const Dispatcher = require('./Dispatcher');

// TODO: Middleware
// TODO: assert

/**
 * @param {Object} action
 */
function execActionPlan(action) {
    const { order, next } = this.getActionPlanInfo(action.type);
    const currentStatus = this.status;
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

    this.status = nextStatus;

    /* publish 'change:status' to listener */
    this.emit('update:status', this.status);

    /* execute $next */
    return next && next(this.dispatch, action, this.status);
}


class AlxStore extends EventEmitter {
    /**
     * @param {Object} status
     * @param {Object} actionPlan
     * @param {Dispatcher} [dispatcher]
     */
    constructor(status, actionPlan, dispatcher) {
        super();
        this.status = status;
        this.actionPlan = actionPlan;
        this.dispatcher = dispatcher || new Dispatcher();
        this.dispatch = this.dispatcher.dispatch.bind(this.dispatcher);
        this.dispatcher.on('dispatch:action', execActionPlan.bind(this));
    }

    get contextList() {
        return Object.keys(this.status);
    }

    /**
     * @param {string} actionType
     * @returns {Object}
     *
     * info.order structure
     * => [ ['contextA' undefined], ['contextB', transformer], ... ]
     */
    getActionPlanInfo(actionType) {
        const ignore = ['order', '$next'];
        const ctxList = this.contextList;
        const targetPlan = this.actionPlan[actionType];
        const next = targetPlan.$next;
        const order = ((plan) => {
            let preorder = plan.order || Object.keys(plan).filter(key => !ignore.includes(key)) || [];
            preorder = ctxList.filter(key => !preorder.includes(key)).concat(preorder);
            return preorder.reduce((container, key) => [...container, [key, plan[key]]], []);
        })(targetPlan);

        return { plan: targetPlan, order, next };
    }

    /**
     * @param {string} [context]
     * @returns {Object} status
     */
    getStatus(context) {
        if (context) return this.status[context];
        return this.status;
    }
}

module.exports = AlxStore;
