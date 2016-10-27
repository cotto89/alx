import test from "ava";
import sinon = require("sinon");
import { compose, Dispatcher } from "./../index";

test("counter", async (t) => {
    t.plan(4);

    interface IStatus {
        counter: { count: number };
    }

    let $status = {
        counter: { count: 0 },
    };

    let dispatcher = new Dispatcher<IStatus>();

    const spyReducer = sinon.spy((status: any, payload: any) => ({
        counter: { count: status.counter.count + payload.count },
    }));

    const increment = compose<IStatus, { count: number }, number>("increment", {
        action: (count: number = 1) => ({ count }),
        reducer: spyReducer,
    });

    dispatcher.subscribe("USECASE:ACTION", ({ usecase, payload }) => {
        $status = usecase.reduce($status, payload);
    });

    await dispatcher.dispatch(increment(10));
    await dispatcher.dispatch(increment(10));
    await dispatcher.dispatch(increment(10));

    t.deepEqual($status, { counter: { count: 30 } });
    t.true(spyReducer.firstCall.calledWithExactly({ counter: { count: 0 } }, { count: 10 }));
    t.true(spyReducer.secondCall.calledWithExactly({ counter: { count: 10 } }, { count: 10 }));
    t.true(spyReducer.thirdCall.calledWithExactly({ counter: { count: 20 } }, { count: 10 }));
});
