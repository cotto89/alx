import sinon = require("sinon");
import { compose } from "./../lib/compose";

export interface IStatus {
    counterA: { count: number };
    counterB: { count: number };
}

export const initialStatus = (): IStatus => ({
    counterA: { count: 0 },
    counterB: { count: 0 },
});

/* UseCase */
export const increment = compose<IStatus, { count: number }, number>
    ("INCREMENT", {
        action: sinon.spy((count = 1) => ({ count })),

        reducer: sinon.spy(({ counterA, counterB}: any, payload: any) => ({
            counterA: { count: counterA.count + payload.count },
            counterB: { count: (counterB.count + payload.count) * 10 },
        })),
    });

export const incrementByReducers = compose<IStatus, { count: number }, number>
    ("INCREMENT", {
        action: (count = 1) => ({ count }),

        reducers: {
            counterA: ({ counterA }, payload) => ({
                count: counterA.count + payload.count,
            }),
        },
    });

export const incrementByMix = compose<IStatus, { count: number }, number>
    ("INCREMENT", {
        action: (count = 1) => ({ count }),

        reducer: ({counterA, counterB}, payload) => ({
            counterA: { count: counterA.count + payload.count },
            counterB: { count: (counterB.count + payload.count) * 10 },
        }),

        reducers: {
            counterB: ({ counterB }, payload) => ({
                count: (counterB.count + payload.count) * 10,
            }),
        },
    });

export const incrementByAsyncAction = compose<IStatus, { count: number }, number>
    ("INCREMENT", {
        action: (count = 1) => new Promise((resolve) => {
            resolve({ count });
        }),

        reducer: ({counterA, counterB}, payload) => ({
            counterA: { count: counterA.count + payload.count },
            counterB: { count: (counterB.count + payload.count) * 10 },
        }),
    });
