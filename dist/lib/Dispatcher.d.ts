/// <reference types="node" />
import { UseCase } from "./UseCase";
export declare const EVENTS: {
    ACTION: string;
    ERROR: string;
};
export declare class Dispatcher<TStatus> {
    listeners: {
        "USECASE:ACTION": Function[];
        "ERROR": Function[];
    };
    /**
     * Creates an instance of Dispatcher.
     *
     *
     * @memberOf Dispatcher
     */
    constructor();
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
        usecase: UseCase<TStatus, any>;
        payload: any;
    }) => any): Function;
    subscribe(event: "ERROR", listener: (error: Error) => any): Function;
    /**
     * Dispatch usecase and payload
     *
     * @template TPayload
     * @param {*} actionResult
     * @returns
     *
     * @memberOf Dispatcher
     */
    dispatch<TPayload>(actionResult: any): Promise<any>;
}
