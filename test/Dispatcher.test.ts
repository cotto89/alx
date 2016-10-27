import test from "ava";
import sinon = require("sinon");
import { Dispatcher, EVENTS } from "./../lib/Dispatcher";
import { UseCase } from "./../lib/UseCase";
import {
    IStatus,
    initialStatus,
    incrementByMix,
} from "./fixtures";

let dispatcher: Dispatcher<IStatus>;

test.beforeEach(() => {
    dispatcher = new Dispatcher<IStatus>();
});

test("subscribe/unsubscribe", (t) => {
    const listeners: { [event: string]: Function[] } = dispatcher.listeners;

    t.is(listeners[EVENTS.ACTION].length, 0);
    t.is(listeners[EVENTS.ERROR].length, 0);

    const listener = () => ({});
    const targetListener = () => ({});

    dispatcher.subscribe("USECASE:ACTION", listener);
    dispatcher.subscribe("USECASE:ACTION", listener);
    const unsubscribeA = dispatcher.subscribe("USECASE:ACTION", targetListener);
    dispatcher.subscribe("USECASE:ACTION", listener);

    const unsubscribeB = dispatcher.subscribe("ERROR", listener);

    t.is(listeners[EVENTS.ACTION].length, 4);
    t.is(listeners[EVENTS.ERROR].length, 1);

    t.deepEqual(listeners[EVENTS.ACTION], [listener, listener, targetListener, listener]);

    unsubscribeA();
    unsubscribeB();

    t.deepEqual(listeners[EVENTS.ACTION], [listener, listener, listener]);

    t.is(listeners[EVENTS.ACTION].length, 3);
    t.is(listeners[EVENTS.ERROR].length, 0);
});

test("dispatch", async (t) => {
    t.plan(3);

    const status = initialStatus();
    dispatcher.subscribe("USECASE:ACTION", ({ usecase, payload }) => {
        const nextStatus = usecase.reduce(status, payload);
        t.deepEqual(nextStatus, {
            counterA: { count: 1 },
            counterB: { count: 10 },
        });
    });

    const {usecase, payload} = await dispatcher.dispatch(incrementByMix(1));
    t.true(usecase instanceof UseCase);
    t.deepEqual(payload, { count: 1 });
});

test("dispatch and error", async (t) => {
    const spy = sinon.spy();
    const usecase = new UseCase("demo", {
        action: () => Promise.reject(new Error("error!")),
    });

    dispatcher.subscribe("USECASE:ACTION", spy);
    dispatcher.subscribe("ERROR", (error) => {
        t.true(error instanceof Error);
    });

    const error = await dispatcher.dispatch(usecase.exec());
    t.true(error instanceof Error);
    t.false(spy.called);
});
