import { UseCase } from "./UseCase";

export const EVENTS = {
    ACTION: "USECASE:ACTION",
    ERROR: "ERROR",
};

export class Dispatcher<TStatus> {
    listeners: {
        "USECASE:ACTION": Function[],
        "ERROR": Function[]
    };

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

    /**
     * Register event listener
     *
     * @param {"USECASE:ACTION" | "ERROR"} event
     * @param {Function} listener
     * @returns {Function} unsubscribe
     *
     * @memberOf Dispatcher
     */
    subscribe(event: "USECASE:ACTION", listener: (result: {
        usecase: UseCase<TStatus, any>,
        payload: any;
    }) => any): Function
    subscribe(event: "ERROR", listener: (error: Error) => any): Function;
    subscribe(event: "USECASE:ACTION" | "ERROR", listener: Function): Function {
        type Listeners = { [event: string]: Function[] }
        const listeners: Listeners = this.listeners;

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
    dispatch<TPayload>(actionResult: any) {
        const listeners: { [event: string]: Function[] } = this.listeners;
        type ret = Promise<{
            usecase: UseCase<TStatus, TPayload>;
            payload: TPayload;
        }>

        return Promise.resolve(actionResult)
            .then((result) => {
                const $listener = listeners[EVENTS.ACTION];

                for (let i = 0; i < $listener.length; i++) {
                    $listener[i](result as ret);
                }

                return result as ret;
            })
            .catch((error) => {
                const $listener = listeners[EVENTS.ERROR];

                for (let i = 0; i < $listener.length; i++) {
                    $listener[i](error);
                }

                return error;
            });
    }
}
