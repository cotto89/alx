import test from 'ava';
import compose from './../lib/compose';
import {
    initialStatus,
    countUpByReducer,
    countUpByReducers,
    countUpByMix,
    countUpByAsyncAction,
    invalidAction
} from './fixtures';


test('component.raw() and type', t => {
    const action = () => {};
    const reducer = () => {};
    const component = compose('COUNT_UP', { action, reducer });
    t.deepEqual(component.raw(), { action, reducer });
    t.is(component.$type, 'COUNT_UP');
});


test('component.raw() without type', t => {
    const action = () => {};
    const reducer = () => {};
    const component = compose({ action, reducer });
    t.deepEqual(component.raw(), { action, reducer });
    t.is(component.$type, undefined);
});


test('countUpByReducer', async t => {
    const { reducer } = countUpByReducer.raw();
    const handlerRet = await countUpByReducer();

    // actionHandler returns
    const { reduce, next, payload } = handlerRet;
    t.is(typeof reduce, 'function');
    t.is(typeof next, 'undefined');
    t.deepEqual(payload, {
        count: 1,
        $type: 'COUNT_UP'
    });

    // reducer should return nextStatus;
    const status = initialStatus();
    const nextStatus = reduce(status);
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
        counterC: { count: 0 }
    });

    // reducer is passed status and payload
    t.true(reducer.calledWithExactly(status, payload));
});


test('countUpByReducers', async t => {
    const { reducers } = countUpByReducers.raw();
    const { counterA, counterB, counterC } = reducers;

    const { reduce, payload } = await countUpByReducers();

    // reducer should return nextStatus;
    const status = initialStatus();
    const nextStatus = reduce(status);
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
        counterC: { count: 100 }
    });

    // reducers function is passed status and payload
    t.true(counterA.calledWithExactly(status[counterA], payload));
    t.true(counterB.calledWithExactly(status[counterB], payload));
    t.true(counterC.calledWithExactly(status[counterC], payload));
});

test('countUpByMix', async t => {
    const { reduce } = await countUpByMix();

    // reducer should return nextStatus;
    const status = initialStatus();
    const nextStatus = reduce(status);
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
        counterC: { count: 0 }
    });
});

test('countUpByAsyncAction', async t => {
    const { reduce } = await countUpByAsyncAction();

    // reducer should return nextStatus;
    const nextStatus = reduce(initialStatus());
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 0 },
        counterC: { count: 0 }
    });
});

test('typeError of payload', t => {
    const message = 'Action return typeError as payload. ' +
        'Payload must be PlainObject.';
    t.throws(invalidAction(), message);
});
