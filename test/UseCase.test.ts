import test from "ava";
import sinon = require("sinon");
import { UseCase } from "./../lib/UseCase";
import {
    Status,
    initialStatus,
    increment,
    incrementByReducers,
    incrementByMix,
    incrementByAsyncAction,
} from "./fixtures";

test("#constructor", async (t) => {
    const chainFn = () => ({});
    const empty = new UseCase();
    const onlyId = new UseCase({ id: "onlyId" });
    const withChainOfFunc = new UseCase({ id: "withChainOfFnuc", chain: chainFn });
    const withoutChainOfFunc = new UseCase({ id: "withChainOfFnunc", chain: [chainFn] });

    // empty
    t.is(empty.id, undefined);
    t.is(empty.action.name, "defaultAction");
    t.is(empty.reducer, undefined);
    t.is(empty.reducers, undefined);
    t.deepEqual(empty.chain, []);

    const { payload, usecase } = await empty.exec();
    t.is(payload, undefined);
    t.is(usecase, empty);

    // onlyId
    t.is(onlyId.id, "onlyId");
    t.is(onlyId.action.name, "defaultAction");

    // withChainOfFnunc, withoutChainOfFunc
    t.deepEqual(withChainOfFunc.chain, [chainFn]);
    t.deepEqual(withoutChainOfFunc.chain, [chainFn]);
});

test("#exec", async (t) => {
    const demo = new UseCase<{}, { count: number }>({
        id: "demo",
        action: (count: number = 1) => ({ count }),
    });

    const { usecase, payload } = await demo.exec<number>(10);
    t.deepEqual(usecase, usecase);
    t.deepEqual(payload, { count: 10 });
});

test("#reudce", async (t) => {
    const status = initialStatus();

    const resultA = await increment(1);
    const nextStatusA = resultA.usecase.reduce(status, resultA.payload);
    t.deepEqual(nextStatusA, {
        counterA: { count: 1 },
        counterB: { count: 10 },
    });

    const resultB = await incrementByReducers(1);
    const nextStatusB = resultB.usecase.reduce(status, resultB.payload);
    t.deepEqual(nextStatusB, {
        counterA: { count: 1 },
        counterB: { count: 0 },
    });
});

test("#next", async (t) => {
    t.plan(5);

    const getStatus = () => ({});
    const dispatch = () => ({});

    const queue: number[] = [];

    // chains
    function* c1({payload}: { payload: { count: number } }) {
        t.deepEqual(payload, { count: 1 });
        const n1 = yield queue.push(payload.count);
        yield queue.push(n1 + 1);
    }

    // generator
    function* c2({ payload }: { payload: { count: number } }) {
        t.deepEqual(payload, { count: 1 });
        const n2 = yield queue.push(payload.count + 2);
        yield queue.push(n2 + 1);
    }

    const c1Spy = sinon.spy(c1);
    const c2Spy = sinon.spy(c2);

    // non generator and return any
    function c3() {
        return "c3";
    }

    // non generator and return undefined
    function c4() {
        const params = {
            payload: { count: 1 },
            getStatus,
            dispatch,
        };

        t.true(c1Spy.calledWithExactly(params));
        t.true(c2Spy.calledWithExactly(params));

        t.deepEqual(queue, [1, 2, 3, 4]);
    }

    const usecase = new UseCase({
        id: "demo",
        action: (count: number = 1) => ({ count }),
        chain: [c1Spy, c2Spy, c3, c4],
    });

    const { payload } = await usecase.exec(1);
    await usecase.next(payload, getStatus, dispatch);

    await Promise.resolve();
});

test("UseCase.initialize#compose", (t) => {
    const { compose } = UseCase.initialize<Status>();
    const demo1 = compose({
        id: "demo1",
    });

    const demo2 = compose((u) => {
        u.id = "demo2";
    });

    t.true(typeof demo1 === "function");
    t.true(typeof demo2 === "function");

    t.true(demo1.usecase instanceof UseCase);
    t.true(demo2.usecase instanceof UseCase);
});

test("UseCase.initilize#link", (t) => {
    const { link } = UseCase.initialize<Status>();
    const chain = () => ({});
    const linked = link(increment, chain, chain);

    t.deepEqual(increment.usecase.chain, []);
    t.deepEqual(linked.usecase.chain, [chain, chain]);
});

test("UseCase.initialize#clone", (t) => {
    const { clone } = UseCase.initialize<Status>();
    const cloned = clone(increment, { id: "cloned" });

    t.is(increment.usecase.id, "INCREMENT");
    t.is(cloned.usecase.id, "cloned");
});

test("Pattern:increment", async (t) => {
    const status = initialStatus();
    const { usecase, payload } = await increment(1);

    const nextStatus = usecase.reduce(status, payload);

    t.deepEqual(payload, { count: 1 });

    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
    });

    t.notDeepEqual(status, nextStatus);
});

test("Pattern:incrementByReducers", async (t) => {
    const status = initialStatus();
    const { usecase, payload } = await incrementByReducers(1);

    const nextStatus = usecase.reduce(status, payload);

    // called params
    const spy: any = (usecase as any).reducers!.counterA;
    t.true(spy.calledWithExactly({ count: 0 }, { count: 1 }));

    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 0 },
    });

    t.notDeepEqual(status, nextStatus);
});

test("Pattern:incrementByMix", async (t) => {
    const status = initialStatus();
    const { usecase, payload } = await incrementByMix(1);

    const nextStatus = usecase.reduce(status, payload);

    // If usecase.reducers are given, they override own state
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 100 },
    });
});

test("Pattern:incrementByAsyncAction", async (t) => {
    const status = initialStatus();
    const { usecase, payload } = await incrementByAsyncAction(1);

    const nextStatus = usecase.reduce(status, payload);

    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
    });
});

test("Pattern:When no reducer(s)", async (t) => {
    const status = initialStatus();
    const { compose } = UseCase.initialize<Status>();
    const { usecase, payload } = await compose()();

    const nextStatus = usecase.reduce(status, payload);

    t.deepEqual(status, nextStatus);
})
