import test from 'ava';
import sinon from 'sinon';
import { compose, ActionEmitter } from './../index';

test('counter', async t => {
    t.plan(4);

    let status = {
        counter: { count: 0 }
    };

    const spyReducer = sinon.spy(({ count }, payload) => ({ count: count + payload.count }));

    const countUp = compose('COUNT_UP', {
        action: (count = 1) => ({ count }),
        reducers: {
            counter: spyReducer
        }
    });

    const emitter = new ActionEmitter();
    const emit = emitter.emit.bind(emitter);


    emitter.on('action', (({ reduce }) => {
        status = reduce(status);
    }));

    await emit(countUp, 10);
    await emit(countUp, 10);
    await emit(countUp, 10);

    t.deepEqual(status, { counter: { count: 30 } });
    t.true(spyReducer.firstCall.calledWithExactly({ count: 0 }, { count: 10, $type: 'COUNT_UP' }));
    t.true(spyReducer.secondCall.calledWithExactly({ count: 10 }, { count: 10, $type: 'COUNT_UP' }));
    t.true(spyReducer.thirdCall.calledWithExactly({ count: 20 }, { count: 10, $type: 'COUNT_UP' }));
});
