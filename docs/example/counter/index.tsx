import * as React from "react";
import { render } from "react-dom";
import { Dispatcher, UseCase, Chain } from "./../../../index";

/* Status */
interface Status {
    counter: CounterState;
}

interface CounterState {
    count: number;
}

/* Dispatcher */
const dispatcher = new Dispatcher<Status>();
const dispatch = dispatcher.dispatch.bind(dispatcher);

/* UseCase initilize */
const { compose, link } = UseCase.initialize<Status>();

/* UseCase and Chain */
const reset = compose((u) => {
    u.id = "RESET";
    u.reducer = () => ({ counter: { count: 0 } });
});

const resetChain: Chain<{ count: number }> = function* resetChain({ getStatus, dispatch }) {
    const { count } = getStatus("counter");
    if (count > 100 || count < -100) {
        yield dispatch(reset());
    }
};

const increment = compose<number, { count: number }>((u) => {
    u.id = "INCREMENT";
    u.action = (count: number = 1) => ({ count });
    u.reducer = (status, payload) => ({
        counter: { count: status.counter.count + payload.count },
    });
    u.chain = [resetChain];
});


const decrementDefault = compose<number, { count: number }>((u) => {
    u.id = "DECREMENT";
    u.action = (count: number = 1) => ({ count });

    // u.reducer = (status, payload) => ({
    //     counter: { count: status.counter.count - payload.count },
    // });

    u.reducers = {
        counter: (state, payload) => ({
            count: (state as CounterState).count - payload.count,
        }),
    };
});

const decrement = link(decrementDefault, resetChain);


/* View */
class Counter extends React.Component<{}, Status> {
    constructor() {
        super();
        this.state = {
            counter: { count: 0 },
        };
    }

    getStatus = (context: string) => {
        const status: { [context: string]: any } = this.state;
        return context ? status[context] : status;
    };

    up = () => dispatch(increment(1));
    up10 = () => dispatch(increment(10));
    down = () => dispatch(decrement(1));
    down10 = () => dispatch(decrement(10));

    componentDidMount() {
        dispatcher.subscribe("USECASE:ACTION", ({ usecase, payload }) => {
            // update state
            this.setState((status) => usecase.reduce(status, payload));

            // logger
            console.info(usecase.id, payload, this.state.counter);

            // next
            usecase.next(payload, this.getStatus, dispatch);
        });

        dispatcher.subscribe("ERROR", (error) => {
            console.error(error);
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

window.addEventListener("DOMContentLoaded", () => {
    render(<Counter />, document.querySelector("#app"));
});
