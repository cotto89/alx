const EventEmitter = require('events');

class ActionEmitter extends EventEmitter {
    /**
     * Execute usecase and publish it.
     *
     * @param {UseCase} usecase
     * @param {any} args - action arguments
     * @returns {Promise}
     *
     * @memberOf ActionEmitter
     */
    emit(usecase, ...args) {
        return Promise.resolve(usecase.exec(...args))
            .then((payload) => {
                super.emit('USECASE:ACTION', usecase, payload);
                return { usecase, payload };
            })
            .catch(err => super.emit('ERROR', err));
    }
}

module.exports = ActionEmitter;
