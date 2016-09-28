import test from 'ava';
import { AlxStore, Dispatcher } from './../index';

test('distribute module', t => {
    t.true(AlxStore.name === 'AlxStore');
    t.true(Dispatcher.name === 'Dispatcher');
});
