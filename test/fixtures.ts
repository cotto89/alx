import sinon = require("sinon");
import { UseCase } from "./../lib/UseCase";

export interface Status {
    counterA: CounterA;
    counterB: CounterB;
}

export interface CounterA {
    count: number;
}

export interface CounterB {
    count: number;
}

const { compose } = UseCase.initialize<Status>();

export const initialStatus = (): Status => ({
    counterA: { count: 0 },
    counterB: { count: 0 },
});

/* UseCase */
export const increment = compose<number, { count: number }>((u) => {
    u.id = "INCREMENT";
    u.action = (count: number = 1) => ({ count });
    u.reducer = (status, payload) => ({
        counterA: { count: status.counterA.count + payload.count },
        counterB: { count: (status.counterB.count + payload.count) * 10 },
    });
});

export const incrementByReducers = compose<number, { count: number }>((u) => {
    u.id = "INCREMENT";
    u.action = (count: number = 1) => ({ count });

    const spy = sinon.spy(function (state: any, payload: any) {
        return {
            count: state.count + payload.count,
        };
    });

    u.reducers = {
        counterA: spy,
    };
});

export const incrementByMix = compose<number, { count: number }>((u) => {
    u.id = "INCREMENT";
    u.action = (count: number = 1) => ({ count });
    u.reducer = (status, payload) => ({
        counterA: { count: status.counterA.count + payload.count },
        counterB: { count: (status.counterA.count + payload.count) * 5 },
    });
    u.reducers = {
        counterB: (state, payload) => ({
            count: ((state as CounterB).count + payload.count) * 100,
        }),
    };
});

export const incrementByAsyncAction = compose<number, { count: number }>((u) => {
    u.id = "INCREMENT";
    u.action = (count: number = 1) => Promise.resolve({ count });
    u.reducer = (status, payload) => ({
        counterA: { count: status.counterA.count + payload.count },
        counterB: { count: (status.counterA.count + payload.count) * 10 },
    });
});
