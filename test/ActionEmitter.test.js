import test from 'ava';
import sinon from 'sinon';
import ActionEmitter from './../lib/ActionEmitter';
import UseCase from './../lib/UseCase';
import { countUpByReducer, invalidAction } from './fixtures';

let emitter, emit;
const event = 'USECASE:ACTION';

test.beforeEach(() => {
    emitter = new ActionEmitter();
    emit = emitter.emit.bind(emitter);
});

test("#emit on 'USECASE:ACTION'", async t => {
    t.plan(3);

    /* Execute usecase.exec() and publish usecase on 'USECASE:ACTION' */
    emitter.on(event, (usecase, payload) => {
        t.true(usecase instanceof UseCase);
        t.deepEqual(payload, {
            $type: 'COUNT_UP',
            count: 1
        });
    });

    /* #emit() return promise having usecase */
    await emit(countUpByReducer).then(({ payload }) => {
        t.deepEqual(payload, {
            $type: 'COUNT_UP',
            count: 1
        });
    });
});

test("#emit on 'ERROR'", async t => {
    t.plan(2);

    const spyHandler = sinon.spy();
    const message = 'Action return typeError as payload. ' +
        'Payload must be PlainObject.';

    emitter.on(event, spyHandler);
    emitter.on('ERROR', (err) => {
        t.is(err.message, message);
    });

    await emit(invalidAction);

    t.false(spyHandler.called);
});
