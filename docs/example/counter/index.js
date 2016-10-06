/* eslint-disable import/no-extraneous-dependencies,
react/jsx-filename-extension,
no-shadow,
no-console,
no-use-before-define
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ActionEmitter, compose } from './../../../index';

/* ActionEmitter */
const actionEmitter = new ActionEmitter();
const emit = actionEmitter.emit.bind(actionEmitter);

/* usecase */
const increment = compose('INCREMENT', {
    action: (count = 1) => ({ count }),
    reducers: {
        counter: (state, payload) => ({ count: state.count + payload.count })
    },
    chain: resetChain
});

const decrement = compose('DECREMENT', {
    // You can return Promise on action
    action: (count = 1) => Promise.resolve({ count }),
    reducer: (status, payload) => ({
        counter: { count: status.counter.count - payload.count }
    })
}).link(resetChain);

const reset = compose('RESET', {
    reducer: () => ({ counter: { count: 0 } })
});

/* Chain */
function* resetChain(payload, getStatus, emit) {
    const count = getStatus('counter').count;
    if (count > 100 || count < -100) {
        yield emit(reset);
    }
}


/* View */
class Counter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            counter: { count: 0 }
        };

        this.getStatus = (context) => {
            if (context) return this.state[context];
            return this.state;
        };

        this.up = () => emit(increment);
        this.down = () => emit(decrement);
        this.up10 = () => emit(increment, 10);
        this.down10 = () => emit(decrement, 10);
    }

    componentDidMount() {
        actionEmitter.on('USECASE:ACTION', (usecase, payload) => {
            this.setState(status => usecase.reduce(status, payload));
            console.log(payload, this.state.counter);
            usecase.next(payload, this.getStatus, emit);
        });

        actionEmitter.on('ERROR', (err) => {
            console.error(err);
        });
    }

    render() {
        return (
            <div className="container">
                <h1>Alx Sample Counter</h1>
                <div className="counter">
                    <div className="count">{this.state.counter.count}</div>
                    <div className="controller">
                        <button onClick={this.up}>+ 1</button>
                        <button onClick={this.down}>- 1</button>
                        <button onClick={this.up10}>+ 10</button>
                        <button onClick={this.down10}>- 10</button>
                    </div>
                </div>
            </div>
        );
    }
}

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(<Counter />, document.querySelector('#app'));
});
