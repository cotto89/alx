const EventEmitter = require('events');

class Dispatcher extends EventEmitter {
    /**
     * Dispatch action to Store.
     *
     * @param {Object|Promise} action
     * @returns Promise
     */
    dispatch(action) {
        return Promise.resolve(action)
            .then($action => this.emit('dispatch:action', $action));
    }
}

module.exports = Dispatcher;
