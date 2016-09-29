const EventEmitter = require('events');
const Dispatcher = require('./Dispatcher');
const generateNextStatus = require('./generateNextStatus');

// TODO: Middleware
// TODO: assert

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
        this.dispatcher.on('dispatch:action', (action) => {
            const info = this.getActionPlanInfo(action.type);
            const nextStatus = generateNextStatus(this.status, action, info);
            this.status = nextStatus;
            this.emit('update:status', this.status);
            info.next && info.next(this.dispatch, action, this.status);
        });
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
