import test from 'ava';
import sinon from 'sinon';
import ActionEmitter from './../lib/ActionEmitter';
import { countUpByReducer, invalidAction } from './fixtures';

let emitter, emit;

test.beforeEach(() => {
    emitter = new ActionEmitter();
    emit = emitter.emit.bind(emitter);
});

test('#emit on action', t => {
    t.plan(6);

    /* #emit() can emit 'action' event and have actionHander result */
    emitter.on('action', ({ reduce, next, payload }) => {
        t.is(typeof reduce, 'function');
        t.is(typeof next, 'undefined');
        t.deepEqual(payload, {
            $type: 'COUNT_UP',
            count: 1
        });
    });

    /* #emit() return promise */
    return emit(countUpByReducer).then(({ reduce, next, payload }) => {
        t.is(typeof reduce, 'function');
        t.is(typeof next, 'undefined');
        t.deepEqual(payload, {
            $type: 'COUNT_UP',
            count: 1
        });
    });
});

test('#emit on error', async t => {
    t.plan(2);

    const spyHandler = sinon.spy();
    const message = 'Action return typeError as payload. ' +
        'Payload must be PlainObject.';

    emitter.on('action', spyHandler);
    emitter.on('error', (err) => {
        t.is(err.message, message);
    });

    await emit(invalidAction);

    t.false(spyHandler.called);
});
