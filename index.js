const UseCase = require('./lib/UseCase.js');
const ActionEmitter = require('./lib/ActionEmitter.js');

module.exports = {
    compose: UseCase.compose,
    UseCase,
    ActionEmitter
};
