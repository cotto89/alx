import test from "ava";
import { compose } from "./../lib/compose";
import { UseCase } from "./../lib/UseCase";
import {
    initialStatus,
    increment,
    incrementByReducers,
    incrementByMix,
    incrementByAsyncAction,
} from "./fixtures";

const status = initialStatus();

test("properties", (t) => {
    const usecase = compose();
    t.true(typeof usecase === "function");
    t.true(typeof usecase.link === "function");
    t.true(usecase.usecase instanceof UseCase);
});

test("compose.link", (t) => {
    const chainFn = () => ({});
    const incrementWithChain = increment.link(chainFn, chainFn);

    t.notDeepEqual(increment, incrementWithChain);
    t.deepEqual(incrementWithChain.usecase.chain, [chainFn, chainFn]);
});

test("increment", async (t) => {
    const { payload, usecase } = await increment(1);

    const nextStatus = usecase.reduce(status, payload);

    // payload
    t.deepEqual(payload, { count: 1 });

    // should return nexetStatus
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
    });

    // immutable update
    t.notDeepEqual(status, nextStatus);
});

test("incrementByReducers", async (t) => {
    const { payload, usecase } = await incrementByReducers(1);

    const nextStatus = usecase.reduce(status, payload);

    // should return nexetStatus
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 0 },
    });

    // immutable update
    t.notDeepEqual(status, nextStatus);
});

test("incrementByMix", async (t) => {
    const { payload, usecase } = await incrementByMix(1);

    const nextStatus = usecase.reduce(status, payload);

    // should return nexetStatus
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
    });

    // immutable update
    t.notDeepEqual(status, nextStatus);
});

test("incrementByAsyncAction", async (t) => {
    const { payload, usecase } = await incrementByAsyncAction(1);

    const nextStatus = usecase.reduce(status, payload);

    // should return nexetStatus
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
    });

    // immutable update
    t.notDeepEqual(status, nextStatus);
});

test("when no reducer(s)", async (t) => {
    const $usecase = compose();
    const { payload, usecase } = await $usecase();

    const nexetStatus = usecase.reduce(status, payload);

    t.deepEqual(status, nexetStatus);
});
