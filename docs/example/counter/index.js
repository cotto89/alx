/* eslint-disable import/no-extraneous-dependencies, react/jsx-filename-extension */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Dispatcher, AlxStore } from './../../../index';

const dispatcher = new Dispatcher();
const dispatch = dispatcher.dispatch.bind(dispatcher);

/* Action */
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

const increment = (count = 1) => ({
    type: INCREMENT,
    count
});

const decrement = (count = 1) => ({
    type: DECREMENT,
    count
});

/* ActionPlan */
const counterActionPlan = () => ({
    [INCREMENT]: {
        counter: (state, action) => ({ count: state.count + action.count })
    },

    [DECREMENT]: {
        counter: (state, action) => ({ count: state.count - action.count })
    }
});

/* Store */
const initialStatus = () => ({
    counter: { count: 0 }
});

const store = new AlxStore(initialStatus(), counterActionPlan(), dispatcher);

/* View */
class Counter extends Component {
    constructor(props) {
        super(props);
        this.state = store.getStatus('counter');
        this.up = () => dispatch(increment());
        this.down = () => dispatch(decrement());
        this.up10 = () => dispatch(increment(10));
        this.down10 = () => dispatch(decrement(10));
    }

    componentDidMount() {
        store.on('update:status', () => {
            this.setState(store.getStatus('counter'));
        });
    }

    render() {
        return (
            <div className="container">
                <h1>Alx Sample Counter</h1>
                <div className="counter">
                    <div className="count">{this.state.count}</div>
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
