import test from 'ava';
import sinon from 'sinon';
import { AlxStore, Dispatcher } from './../index';
import {
    DECREMENT_COUNT,
    initialStatus,
    actions,
    planSimple,
    planWithOrder,
    planWithNext,
    planMix
} from './fixtures';

const spyHandlerGen = (queue) => sinon.spy((...args) => queue.push(args));

const createStore = (planSrc, dispatcher) => {
    const { plan, ...spys } = planSrc();
    const store = new AlxStore(initialStatus(), plan, dispatcher);
    return { store, plan, ...spys };
};

const incrementRet = actions.increment();

test('dispatch action on planSimple', async t => {
    t.plan(4);

    const dispatcher = new Dispatcher();
    const dispatch = dispatcher.dispatch.bind(dispatcher);
    const { store, ...spys } = createStore(planSimple, dispatcher);
    const { counterASpy, counterBSpy } = spys;
    const currentStatus = store.getStatus();

    store.on('update:status', () => {
        /* update status */
        t.deepEqual(store.getStatus(), {
            counterA: { count: 1 },
            counterB: { count: 2 },
            a: { b: true }
        });

        /* immutable update */
        t.notDeepEqual(currentStatus, store.getStatus());
    });

    await dispatch(actions.increment());

    /* callback args */
    t.true(counterASpy.calledWith({ count: 0 }, incrementRet, currentStatus));
    t.true(counterBSpy.calledWith({ count: 0 }, incrementRet, currentStatus));
});

test('dispatch action on planWithOrder', async t => {
    t.plan(4);

    const { store, ...spys } = createStore(planWithOrder);
    const { counterASpy, counterBSpy } = spys;
    const currentStatus = store.getStatus();

    store.on('update:status', () => {
        /* update status */
        t.deepEqual(store.getStatus(), {
            counterA: { count: 1 },
            counterB: { count: 2 },
            a: { b: true }
        });

        t.notDeepEqual(currentStatus, store.getStatus());
    });

    await store.dispatch(actions.increment());

    /* callback args */
    t.true(counterASpy.calledWith({ count: 0 }, incrementRet, currentStatus));
    t.true(counterBSpy.calledWith({ count: 0 }, incrementRet, currentStatus));
});


test('dsipatch action on planWithNext', async t => {
    t.plan(4);

    const { store, ...spys } = createStore(planWithNext);
    const { counterBSpy, $nextSpy } = spys;
    const currentStatus = store.getStatus();
    const queue = [];
    const spyHandler = spyHandlerGen(queue);

    store.on('update:status', spyHandler);

    await store.dispatch(actions.increment());

    await Promise.resolve().then(() => {
        /* correct status by chain action */
        t.deepEqual(queue, [
            [
                { counterA: { count: 1 }, counterB: { count: 0 }, a: { b: true } }
            ],
            [
                { counterA: { count: 1 }, counterB: { count: -1 }, a: { b: true } }
            ]
        ]);

        /* immutable update */
        t.notDeepEqual(currentStatus, store.getStatus());

        /* callback args */
        t.true($nextSpy.calledWithExactly(store.dispatch,
            incrementRet, queue[0][0]
        ));

        // counterA fn -> (update status) -> next fn -> counterB fn
        t.skip.true(counterBSpy.calledWith({ count: 0 }, {
            type: DECREMENT_COUNT,
            count: 1
        }, queue[1][0]));
    });
});


test('dsipatch action on planMix', async t => {
    t.plan(3);

    const { store, ...spys } = createStore(planMix);
    const { mixSpy } = spys;
    const currentStatus = store.getStatus();
    const queue = [];
    const spyHandler = spyHandlerGen(queue);

    store.on('update:status', spyHandler);

    store.dispatch(actions.increment());

    await Promise.resolve().then(() => {
        /* correct status */
        t.deepEqual(queue[0], [
            { counterA: { count: 1 }, counterB: { count: 2 }, a: { b: false } }
        ]);

        /* immutable update */
        t.notDeepEqual(currentStatus, store.getStatus());

        /* callback args */
        t.true(mixSpy.calledWith(undefined, incrementRet, currentStatus));
    });
});
