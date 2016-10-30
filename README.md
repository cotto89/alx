# Alx

Simple flux implementation.

Alx provides only `Dispatcher` and `UseCase` module. `Dispatcher` is like a `EventEmitter` for Alx. `UseCase` is a logic component included `action`, `reducer(s)` and next process named `chain`.

**Alx does not provide `Store`**. You can impletemt store what you want.

## Table of Contents

* [Installation](#installation)
* [Example](#example)
* [Usage](#usage)
	+ [Terminologies](#terminologies)
	+ [Basic](#basic)
	+ [Advanced](#advanced)
* [API][api-link]

## Installation

    npm install --save alx

## Example

-   [CounterApp][counter] [[src]][counter-src]

[counter]: https://cotto89.github.io/alx/example/counter/

[counter-src]: https://github.com/cotto89/alx/tree/master/docs/example/counter

## Usage

### Terms

-   **context**: Domain context of state.
-   **status**: Set of state.
-   **state**: State of context.

```js
const status = {
	context: { state }
}
```

-   **action**: Function that return payload.
-   **payload**: Something that returned from action.

```js
function action(count = 1) {
	return { count }
}

const payload = action();
```

-   **usecase**: Component of action, reducer(s) and chain.
-   **reducer**: Function that return next status.
-   **reducers**: Function that return next state.
-   **chain**: Function of next process depend on the usecase

### Basic

#### initialize

```js
import { UseCase } from "alx";
// helper functions of UseCase
const { compose, link, clone } = UseCase.initialize();
```

#### Create an `usecase`

`UseCase` is a component of `action`, `reducer(s)` and `chain`. chain is that next process depend on the usecase.

```js
import { UseCase } from "alx";

const { compose, link, clone } = UseCase.initialize();


/* usecase */
const increment = compose((u) => {
	u.id = "INCREMENT";
	u.action = (count = 1) => ({ count });
	u.reducer = (status, payload) => ({
    	counter: { count: status.counter.count + payload.count }
    });
})
```

`compose` is a wrapper function of UseCaseClass.

```js
import assert from 'assert';
import { UseCase } from 'alx';

assert(increment.usecase instanceof UseCase)
```

#### Set up an `Dispatcher`

Dispatcher is like a EventEmitter for alx.

```js
import { Disptcher } from 'alx';

const dispatcher  = new Dispatcher();
const dispatch = dispatcher.dispatch.bind(dispatcher);
```

You can subsribe `'USECASE:ACTION'` or `'ERROR'` events from Dispatcher.

Dispatcher publishes `usecase` instance and `payload` on `'USECASE:ACTION'` event or `error` on `ERRPR` event.

```js
dispatcher.subscribe('USECASE:ACTION', ({usecase, payload}) => {
	...
});

dispatcher.subscribe('ERROR', (error) => {
    ...
});
```

#### Update Status

For update status, You can use `UseCase#reduce` in `USECASE:ACTION` event handler of Dispatcher. `UseCase#reduce` implements `usecase.reducer(s)` and return nextStatus.

```js
/* initial status */
let status = {
    counter: { count: 0 }
};

dispatcher.subscribe('USECASE:ACTION', ({ usecase, payload }) => {
    const nextStatus = usecase.reduce(status, payload);

    assert.deepEqual(nextStatus, { counter: { count: 10 } });
    assert.deepEqual(payload, { count: 10 });
    assert(usecase.id === "INCREMENT");
});
```

Then dispatch payload for update status.

```js
dispatch(increment(10))
```

#### OverView

```js
import assert from 'assert';
import { UseCase, Dispatcher } from 'alx';


/* usecase */
const { comppse } = UseCase.initialize();

const increment = compose((u) => {
	u.id = "INCREMENT";
	u.action = (count = 1) => ({ count });
	u.reducer = (status, payload) => ({
    	counter: { count: status.counter.count + payload.count }
    });
})

/* Dispatcher */
const dispatcher  = new Dispatcher();
const dispatch = dispatcher.dispatch.bind(dispatcher);

/* initial status */
let status = {
	counter: { count: 0 }
};

/* listen dispatcher */
dispatcher.subscribe('USECASE:ACTION', ({ usecase, payload }) => {
	const nextStatus = usecase.reduce(status, payload);

	assert.deepEqual(status, { counter: { count: 10 } });
	assert.deepEqual(payload, { count: 10 });
	assert(usecase.id === "INCREMENT");
});

disptcher.subscribe('ERROR', (error) => {
	console.error(error)
});

/* emit usecase */
disptch(increment(1));
```

### Advanced

#### Split reducer

You can use `reducers` property. `usecase.reducer` must return complete status. But `usecase.reducers` have only to return own context state.

```js
let status = {
  counter: { count: 0 }
};

const increment = compose('INCREMENT', {
    action: (count = 1) => ({ count }),
    /*
    reducer: (status, payload) => ({
    	counter: { count: status.counter.count + payload.count }
    });
    */
    reducers: {
    	counter: (state, payload) => ({
    		count: state.count + payload.count
    	})
    }
})
```

#### Async action

`action` can return Promise directly.

```js
const increment = compose((u) => {
	u.id = "INCREMENT";
	u.action = (count = 1) => Promise.resolve({ count });
	u.reducer = (status, payload) => ({
    	counter: { count: status.counter.count + payload.count }
    });
})
```

#### UseCase chain

Create usecase and chain function. `Chain` is next process depend on the usecase.

`Chain` can use `GeneratorFunction`. I recommend to use `GeneratorFunciton`. It let debugging to easy.

```js
/* usecase */
const reset = compose((u) => {
    u.id = "RESET";
    u.reducer = () => ({ counter: { count: 0 } });
});

const resetChain = function* resetChain({ getStatus, dispatch }) {
    const { count } = getStatus("counter");
    if (count > 100 || count < -100) {
        yield dispatch(reset());
    }
};
```

Apply chain. `usecase.chain` accept Array of Function or Function.

```js
// chain property
const increment = compose((u) => {
	u.id = "INCREMENT";
	...
	u.chain = resetChain // or [resetChain]
})
```



The same as above, `link()` helper that initialized by UseCase can add chain to the `usecase.chain`. It also accept multiple chain function like `link(increment, chain, chain)`.

```js
const { link } = UseCase.initialize();
const incrementWithReset = link(increment, resetChain);
```

`UseCase#next` implements chain. Chain functions are implemented asynchronous.

```js
// UseCase#next
dispatcher.subscribe('USECASE:ACTION', ({ usecase, payload }) => {
   usecase.next(payload, getStatus, emit);
});
```

Alx does not provide `store`. So you need to implement suitably `getStatus` function.

#### Pattern of UseCase

##### Omit usecaseId

```js
const usecase = compose((u) => {
	u.action = () => {...}
})
```

UseCaseId can omit. When omit id , usecase.id is `undefined` by default.

If you dont need id, you omit id.

##### Omit action

```js
const usecase = compose((u) => {
	u.id = "SUMETHING";
	u.reducer = () => {...}
})
```

When omit `action`, default action is setted automaticaly. default action will return `undefined` as payload.

`action` can omit, if all reducer(s) dont need payload or action do not have a specific value.

##### Omit reducer(s)

```js
const usecase = compose((u) => {
	u.id = "SUMETHING";
	u.action = () => {...}
})
```

When omit `reducer(s)`, payload and usecaes is published but status will not change.

This pattern is useful when You want only to link chain or want to publish event that dont change state for something.

## API

https://github.com/cotto89/alx/blob/master/docs/api.md

[api-link]:https://github.com/cotto89/alx/blob/master/docs/api.md