import sinon from 'sinon';
import compose from './../lib/compose';

export const initialStatus = () => ({
    counterA: { count: 0 },
    counterB: { count: 0 },
    counterC: { count: 0 }
});

/* component */
export const countUpByReducer = compose('COUNT_UP', {
    action: sinon.spy((count = 1) => ({ count })),
    reducer: sinon.spy(({ counterA, counterB, counterC }, payload) => ({
        counterA: { count: counterA.count + payload.count },
        counterB: { count: (counterB.count + payload.count) * 10 },
        counterC
    }))
});

export const countUpByReducers = compose('COUNT_UP', {
    action: (count = 1) => ({ count }),
    reducers: {
        counterA: sinon.spy(({ count }, payload) => ({
            count: count + payload.count
        })),
        counterB: sinon.spy(({ count }, payload) => ({
            count: (count + payload.count) * 10
        })),
        counterC: sinon.spy(({ count }, payload) => ({
            count: (count + payload.count) * 100
        }))
    }
});

export const countUpByMix = compose('COUNT_UP', {
    action: (count = 1) => ({ count }),
    reducer: (status, payload) => {
        const { counterA, counterB, counterC } = status;
        return {
            counterA: { count: counterA.count + payload.count },
            counterB,
            counterC
        };
    },
    reducers: {
        counterB: ({ count }, payload) => ({
            count: (count + payload.count) * 10
        })
    }
});

export const countUpByAsyncAction = compose({
    action: (count = 1) => new Promise(resolve => {
        resolve({ count });
    }),
    reducer: (status, payload) => {
        const { counterA, counterB, counterC } = status;
        return {
            counterA: { count: counterA.count + payload.count },
            counterB,
            counterC
        };
    }
});

export const invalidAction = compose({
    action: () => 'typeError'
});

export const blankAction = compose('COUNT_UP', {
    reducer: (status) => Object.assign({}, status, {
        counterA: { count: status.counterA.count + 1 }
    })
});
