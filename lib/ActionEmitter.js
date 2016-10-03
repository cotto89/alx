const EventEmitter = require('events');

class ActionEmitter extends EventEmitter {
    /**
     * Emit component
     *
     * @param {Function} component
     * @param {any} args - action arguments
     * @returns {Promise}
     *
     * @memberOf ActionEmitter
     */
    emit(component, ...args) {
        return Promise.resolve(component(...args))
            .then((result) => {
                result && super.emit('action', result);
                return result;
            })
            .catch(err => super.emit('error', err));
    }
}

module.exports = ActionEmitter;
