import sinon from 'sinon';

export const INCREMENT_COUNT = 'INCREMENT_COUNT';
export const DECREMENT_COUNT = 'DECREMENT_COUNT';

/* status */
export const initialStatus = () => ({
    counterA: { count: 0 },
    counterB: { count: 0 },
    a: { b: true }
});

/* action */
export const increment = (count = 1) => ({
    type: INCREMENT_COUNT,
    count
});

export const asyncDecrement = (count = 1) => Promise.resolve({
    type: DECREMENT_COUNT,
    count
});

export const actions = { increment, asyncDecrement };


/* actionPlan */
export const planSimple = () => {
    const counterASpy = sinon.spy((state, action) => ({
        count: state.count + action.count
    }));

    const counterBSpy = sinon.spy((state, action) => ({
        count: state.count + action.count + 1
    }));

    const plan = () => ({
        [INCREMENT_COUNT]: {
            counterA: counterASpy,
            counterB: counterBSpy
        },

        [DECREMENT_COUNT]: {
            counterA: counterASpy,
            counterB: counterBSpy
        }
    });

    return { plan: plan(), counterASpy, counterBSpy };
};


export const planWithNext = () => {
    const counterASpy = sinon.spy((state, action) => ({
        count: state.count + action.count
    }));

    const counterBSpy = sinon.spy((state, action) => ({
        count: state.count - action.count
    }));

    const $nextSpy = sinon.spy((dispatch, action) => Promise.resolve()
        .then(() => dispatch(asyncDecrement(action.count))));

    const plan = () => ({
        [INCREMENT_COUNT]: {
            counterA: counterASpy,
            $next: $nextSpy
        },

        [DECREMENT_COUNT]: {
            counterB: counterBSpy
        }
    });

    return { plan: plan(), counterASpy, counterBSpy, $nextSpy };
};

export const planWithOrder = () => {
    const counterASpy = sinon.spy((state, action) => ({
        count: state.count + action.count
    }));

    const counterBSpy = sinon.spy((state, action) => ({
        count: state.count + action.count + 1
    }));

    const plan = () => ({
        [INCREMENT_COUNT]: {
            order: ['counterB', 'counterA'],
            counterA: counterASpy,
            counterB: counterBSpy
        }
    });

    return { plan: plan(), counterASpy, counterBSpy };
};

export const planMix = () => {
    const counterASpy = sinon.spy((state, action) => ({
        count: state.count + action.count
    }));

    const mixSpy = sinon.spy((state, action, status) => ({
        counterB: { count: status.counterB.count + action.count + 1 }
    }));

    const plan = () => ({
        [INCREMENT_COUNT]: {
            counterA: counterASpy,
            mix: mixSpy
        }
    });

    return { plan: plan(), counterASpy, mixSpy };
};
