"use strict";
exports.EVENTS = {
    ACTION: "USECASE:ACTION",
    ERROR: "ERROR",
};
class Dispatcher {
    /**
     * Creates an instance of Dispatcher.
     *
     *
     * @memberOf Dispatcher
     */
    constructor() {
        this.listeners = {
            "USECASE:ACTION": [],
            "ERROR": [],
        };
    }
    subscribe(event, listener) {
        const listeners = this.listeners;
        listeners[event].push(listener);
        return function unsubscribe() {
            const index = listeners[event].findIndex((target) => {
                return target === listener;
            });
            listeners[event].splice(index, 1);
            return listener;
        };
    }
    /**
     * Dispatch usecase and payload
     *
     * @template TPayload
     * @param {*} actionResult
     * @returns
     *
     * @memberOf Dispatcher
     */
    dispatch(actionResult) {
        const listeners = this.listeners;
        return Promise.resolve(actionResult)
            .then((result) => {
            const $listener = listeners[exports.EVENTS.ACTION];
            for (let i = 0; i < $listener.length; i++) {
                $listener[i](result);
            }
            return result;
        })
            .catch((error) => {
            const $listener = listeners[exports.EVENTS.ERROR];
            for (let i = 0; i < $listener.length; i++) {
                $listener[i](error);
            }
            return error;
        });
    }
}
exports.Dispatcher = Dispatcher;
//# sourceMappingURL=Dispatcher.js.map