import test from 'ava';
import { compose, ActionEmitter } from './../index';

test('distribute module', t => {
    t.is(ActionEmitter.name, 'ActionEmitter');
    t.is(compose.name, 'compose');
});
