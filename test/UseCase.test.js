import test from 'ava';
import UseCase, { compose } from './../lib/UseCase';
import {
    initialStatus,
    countUpByReducer,
    countUpByReducers,
    countUpByMix,
    countUpByAsyncAction,
    invalidAction,
    blankAction
} from './fixtures';

test('#constructor', async t => {
    const chainFn = () => {};
    const withType = compose('withType');
    const withoutType = compose();
    const withChainOfFunc = compose('withChainOfFunc', { chain: chainFn });
    const withChainOfArray = compose('withChainOfArray', { chain: [chainFn] });

    // withType
    t.is(withType.$type, 'withType');
    t.deepEqual(withType.chain, []);
    // withoutType
    t.is(withoutType.$type, undefined);
    t.deepEqual(withoutType.chain, []);
    // withChainOfFunc
    t.deepEqual(withChainOfFunc.chain, [chainFn]);
    // withChainOfArray
    t.deepEqual(withChainOfArray.chain, [chainFn]);
});

test('usecase  with type', async t => {
    const usecase = new UseCase('DEMO');
    t.is(usecase.$type, 'DEMO');
    const { payload } = await usecase.exec();
    t.deepEqual(payload, { $type: 'DEMO' });
});


test('usecase without type', async t => {
    const usecase = new UseCase();
    t.is(usecase.$type, undefined);
    const { payload } = await usecase.exec();
    t.deepEqual(payload, { $type: undefined });
});

test('UseCase.clone', async t => {
    const usecase = new UseCase('demo');
    const clonedUseCase = UseCase.clone(usecase, { $type: 'cloned' });

    t.is(clonedUseCase.$type, 'cloned');

    await clonedUseCase.exec();

    t.deepEqual(clonedUseCase.payload, { $type: 'cloned' });
    t.deepEqual(usecase.payload, {});
});

test('countUpByReducer', async t => {
    const usecase = await countUpByReducer.exec();
    const reducer = usecase.reducer;

    // payload
    t.deepEqual(usecase.payload, {
        $type: 'COUNT_UP',
        count: 1
    });


    t.is(typeof usecase.reduce, 'function');
    t.deepEqual(usecase.chain, []);

    // reducer should return nextStatus;
    const status = initialStatus();
    const nextStatus = usecase.reduce(status);
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
        counterC: { count: 0 }
    });

    // reducer is passed status and payload
    t.true(reducer.calledWithExactly(status, usecase.payload));
});


test('countUpByReducers', async t => {
    const usecase = await countUpByReducers.exec();
    const { payload } = usecase;

    const { counterA, counterB, counterC } = usecase.reducers;

    // reducer should return nextStatus;
    const status = initialStatus();
    const nextStatus = usecase.reduce(status);
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
    const usecase = await countUpByMix.exec();

    // reducer should return nextStatus;
    const status = initialStatus();
    const nextStatus = usecase.reduce(status);
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 10 },
        counterC: { count: 0 }
    });
});

test('countUpByAsyncAction', async t => {
    const usecase = await countUpByAsyncAction.exec();

    // reducer should return nextStatus;
    const nextStatus = usecase.reduce(initialStatus());
    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 0 },
        counterC: { count: 0 }
    });
});

test('typeError of payload', t => {
    const message = 'Action return typeError as payload. ' +
        'Payload must be PlainObject.';
    t.throws(invalidAction.exec(), message);
});

test('blankAction', async t => {
    const usecase = await blankAction.exec();
    const nextStatus = usecase.reduce(initialStatus());

    t.deepEqual(nextStatus, {
        counterA: { count: 1 },
        counterB: { count: 0 },
        counterC: { count: 0 }
    });

    t.deepEqual(usecase.payload, {
        $type: 'COUNT_UP'
    });
});


test('#link', async t => {
    const usecase = compose('demo');
    const gen1 = () => {};
    const gen2 = () => {};

    const withChain = usecase.link(gen1).link(gen2);
    const withChain2 = usecase.link(gen1, gen2);

    // clone and return new UseCase includes chain
    t.notDeepEqual(usecase, withChain);
    t.deepEqual(withChain.chain, [gen1, gen2]);
    t.deepEqual(withChain2.chain, [gen1, gen2]);
});


test('#next', async t => {
    t.plan(4);

    const queue = [];

    function* c1(getStatus, emit, payload) {
        t.deepEqual(payload, { $type: 'withChain', count: 1 });
        const n1 = yield queue.push(payload.count);
        yield queue.push(n1 + 1);
    }

    function* c2(getStatus, emit, payload) {
        t.deepEqual(payload, { $type: 'withChain', count: 1 });
        const n3 = yield queue.push(payload.count + 2);
        yield queue.push(n3 + 1);
    }

    const usecaseChain = compose('withChain', {
        action: (count = 1) => ({ count })
    }).link(c1).link(c2);


    t.is(usecaseChain.chain.length, 2);

    await usecaseChain.exec();
    await usecaseChain.next();

    await new Promise(resolve => {
        setTimeout(() => {
            t.deepEqual(queue, [1, 2, 3, 4]);
            resolve();
        });
    });
});
