import test from 'ava';
import { compose, UseCase, ActionEmitter } from './../index';

test('distribute module', t => {
    t.is(ActionEmitter.name, 'ActionEmitter');
    t.is(UseCase.name, 'UseCase');
    t.is(compose.name, 'compose');
});
