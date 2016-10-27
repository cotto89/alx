import test from "ava";
import sinon = require("sinon");
import { UseCase } from "./../lib/UseCase";
import {
    initialStatus,
    increment,
    incrementByReducers,
} from "./fixtures";

test("#constructor", async (t) => {
    const chainFn = () => ({});
    const empty = new UseCase();
    const onlyId = new UseCase("onlyId");
    const withChainOfFunc = new UseCase("withChainOfFnuc", { chain: chainFn });
    const withoutChainOfFunc = new UseCase("withChainOfFnunc", { chain: [chainFn] });

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

test("UseCase.clone", (t) => {
    const actionB = () => ({});
    const usecase = new UseCase("demo");
    const cloned = UseCase.clone(usecase, { id: "cloned", action: actionB });

    t.is(cloned.id, "cloned");
    t.is(usecase.id, "demo");
    t.not(usecase.action, cloned.action);
});

test("UseCase#exec", async (t) => {
    const demo = new UseCase<{}, { count: number }>("demo", {
        action: (count: number = 1) => ({ count }),
    });

    const { usecase, payload } = await demo.exec<number>(10);
    t.deepEqual(usecase, usecase);
    t.deepEqual(payload, { count: 10 });
});

test("UseCase#reudce", async (t) => {
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

test("UseCase#link", (t) => {
    const chainFn = () => ({});
    const incrementWithChain = increment.usecase.link(chainFn, chainFn);

    t.notDeepEqual(increment.usecase, incrementWithChain);
    t.deepEqual(incrementWithChain.chain, [chainFn, chainFn]);
});

test("UseCase#next", async (t) => {
    t.plan(5);

    const getStatus = () => ({});
    const dispach = () => ({});

    const queue: number[] = [];

    // generator
    function* c1(payload: { count: number }) {
        t.deepEqual(payload, { count: 1 });
        const n1 = yield queue.push(payload.count);
        yield queue.push(n1 + 1);
    }

    // generator
    function* c2(payload: { count: number }) {
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
        t.true(c1Spy.calledWithExactly({ count: 1 }, getStatus, dispach));
        t.true(c2Spy.calledWithExactly({ count: 1 }, getStatus, dispach));

        t.deepEqual(queue, [1, 2, 3, 4]);
    }

    const usecase = new UseCase("demo", {
        action: (count: number = 1) => ({ count }),
        chain: [c1Spy, c2Spy, c3, c4],
    });

    const { payload } = await usecase.exec(1);
    await usecase.next(payload, getStatus, dispach);

    await Promise.resolve();
});
