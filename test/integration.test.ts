import test from "ava";
import sinon = require("sinon");
import { UseCase, Dispatcher } from "./../index";


test("counter", async (t) => {
    t.plan(4);

    interface Status {
        counter: { count: number };
    }

    let $status = {
        counter: { count: 0 },
    };

    let dispatcher = new Dispatcher<Status>();

    const { compose } = UseCase.initialize<Status>();

    const spyReducer = sinon.spy((status: any, payload: any) => ({
        counter: { count: status.counter.count + payload.count },
    }));

    const increment = compose<number, { count: number }>((u) => {
        u.action = (count: number = 1) => ({ count });
        u.reducer = spyReducer;
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
