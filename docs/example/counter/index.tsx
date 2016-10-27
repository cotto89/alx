import * as React from "react";
import { render } from "react-dom";
import { Dispatcher, compose } from "./../../../index";

/* Status */
interface Status {
    counter: { count: number };
}

/* Dispatcher */
const dispatcher = new Dispatcher<Status>();
const dispach = dispatcher.dispatch.bind(dispatcher);

/* UseCase and Chain */
const reset = compose("RESET", {
    reducer: () => ({
        counter: { count: 0 },
    }),
});

const resetChain = function* resetChain(_payload: any, getStatus: Function, dispatch: Function) {
    const {count} = getStatus("counter");
    if (count > 100 || count < -100) {
        yield dispatch(reset());
    }
};

const increment = compose<Status, { count: number }, number>
    ("INCREMENT", {
        action: (count: number = 1) => ({ count }),
        reducer: (status, payload) => ({
            counter: { count: status.counter.count + payload.count },
        }),
        chain: resetChain,
    });

const decrement = compose<Status, { count: number }, number>
    ("DECREMENT", {
        action: (count: number = 1) => ({ count }),
        // reducer: (status, payload) => ({
        //     counter: { count: status.counter.count - payload.count },
        // }),
        reducers: {
            counter: (status, payload) => ({
                count: status.counter.count - payload.count,
            }),
        },
    }).link(resetChain);

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

    up = () => dispach(increment(1));
    up10 = () => dispach(increment(10));
    down = () => dispach(decrement(1));
    down10 = () => dispach(decrement(10));

    componentDidMount() {
        dispatcher.subscribe("USECASE:ACTION", ({ usecase, payload }) => {
            // update state
            this.setState((status) => usecase.reduce(status, payload));

            // logger
            console.info(usecase.id, payload, this.state.counter);

            // next
            usecase.next(payload, this.getStatus, dispach);
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
