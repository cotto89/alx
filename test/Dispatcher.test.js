import test from 'ava';
import Dispatcher from './../lib/Dispatcher';

let dispatcher, dispatch;

const actionFn = () => ({ type: 'ACTION', value: true });
const asyncActionFn = () => new Promise(resolve => {
    setTimeout(() => {
        resolve({ type: 'ASYNC_ACTION', value: true });
    });
});

test.beforeEach(() => {
    dispatcher = new Dispatcher();
    dispatch = dispatcher.dispatch.bind(dispatcher);
});


/* Dispatcher#dispatch */
test('#dispatch: return promise', t => {
    t.true(dispatch(actionFn()) instanceof Promise);
});


test('#dispatch: dispatch action to listener', t => {
    t.plan(1);

    dispatcher.on('dispatch:action', (action) => {
        t.deepEqual(action, { type: 'ACTION', value: true });
    });

    return dispatch(actionFn());
});


test('#dispatch: accept action by Promise directory', t => {
    t.plan(1);

    dispatcher.on('dispatch:action', (action) => {
        t.deepEqual(action, { type: 'ASYNC_ACTION', value: true });
    });

    return dispatch(asyncActionFn());
});
