# Alx

Simple flux implementation.

Alx provides only `ActionEmitter` and `UseCase` module. `ActionEmitter` is a `EventEmitter` for Alx. `UseCase` is a logic component included `action`, `reducer` and next process named `chain`.

**Alx does not provide `Store`**. You can impletemt store what you want to.

## Table of Contents

* [Installation](#installation)
* [Example](#example)
* [Usage](#usage)
	+ [Words](#words)
	+ [Basic](#basic)
	+ [Advanced](#advanced)
* [API][api-link]

## Installation

    npm install --save alx

## Example

-   [Counter][counter] [[src]][counter-src]

[counter]: https://cotto89.github.io/alx/example/counter/

[counter-src]: https://github.com/cotto89/alx/tree/master/docs/example/counter

## Usage

### Words

-   **context**: Domain context of state.
-   **status**: Set of state.
-   **state**: State of context.

```js
const status = {
	context: { state }
}
```

-   **payload**: Plain object returned by action.
-   **action**: Function that return payload.

```js
function action() {
	return { $type: 'ACTION' }
}

const payload = action();
```

-   **chain**: Generator function of next process depend on the usecase
-   **reducer**: Function that return next status.
-   **reducers**: Function that return next state.
-   **usecase**: Component of action, reducer and chain.

### Basic

#### Create an `usecase`

`UseCase` is a component of `action`, `reducer(s)` and `chain`. chain is next process depend on the usecase.

```js
import { compse } from 'alx';

/* usecase */
const increment = compose('INCREMENT', {
    action: (count = 1) => ({ count }),
    reducer: (status, payload) => ({
    	counter: { count: status.counter.count + payload.count }
    })
});

/*
// The same as above
import { UseCase } from 'alx';

const increment = new UseCase('INCREMENT', {
	...
});
*/
```

#### Set up an `ActionEmitter`

ActionEmitter is a extended EventEmitter for alx.

```js
import { ActionEmitter } from 'alx';

const emitter  = new ActionEmitter();
const emit = emitter.emit.bind(emitter);
```

You can subsribe `'USECASE:ACTION'` and `'ERROR'` events of ActionEmitter.

ActionEmitter implement `usecase.action` and publish `usecase` and `payload` on `'USECASE:ACTION'` event.

```js
emitter.on('USECASE:ACTION', (usecase, payload) => {
	...
});

emitter.on('ERROR', (error) => {
    ...
});
```

#### Update Status

For update status, You can use `UseCase#reduce` in `USECASE:ACTION` event handler of ActionEmitter. `UseCase#reduce` implement `usecase.reducer(s)` and return nextStatus.

```js
/* initial status */
let status = {
    counter: { count: 0 }
};

emitter.on('USECASE:ACTION', (usecase, payload) => {
    const nextStatus = usecase.reduce(status, payload);

    assert.deepEqual(nextStatus, { counter: { count: 10 } });
    assert.deepEqual(payload, { $type: 'INCREMENT', count: 10 });

});
```

Then emit usecase for update status.
Pass usecase reference and action arguments to emit function.

```js
emit(increment, 10)
```

#### OverView

```js
import assert from 'assert';
import { compse, ActionEmitter } from 'alx';

/* usecase */
const increment = compose('INCREMENT', {
    action: (count = 1) => ({ count }),
    reducer: (status, payload) => ({
    	counter: { count: status.counter.count + payload.count }
    });
})

/* ActionEmitter */
const emitter  = new ActionEmitter();
const emit = emitter.emit.bind(emitter);

/* initial status */
let status = {
	counter: { count: 0 }
};

/* listen emitter */
emitter.on('USECASE:ACTION', (usecase, payload) => {
	const nextStatus = usecase.reduce(status, payload);

	assert.deepEqual(status, { counter: { count: 10 } });
	assert.deepEqual(payload, { $type: 'INCREMENT', count: 10 });
});

emitter.on('ERROR', (error) => {
	console.error(error)
});

/* emit usecase */
emit(increment, 10);
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
const increment = compose('INCREMENT', {
    action: (count = 1) => Promise.resolve({ count }),
    reducer: (status, payload) => ({
    	counter: { count: status.counter.count + payload.count }
    });
})
```

#### UseCase chain

Create usecase and chain function. `Chain` is next process depend on the usecase.

Chain function must use **Generator function**.

```js
/* usecase */
const reset = compose('RESET', {
    reducer: () => ({ counter: { count: 0 } })
});

/* chain */
const resetChain = function* (getStatus, emit, payload) {
	const count = getStatus('counter').count;
    if (count > 100 || count < -100) {
        yield emit(reset);
    }
}
```

Apply chain. `usecase.chain` accept Array of Function or Function.

```js
// chain property
const increment = compose('INCREMENT', {
	...
    chain: resetChain // or [resetChain]
})
```

The same as above, `UseCase#link` can add chain to the `usecase.chain`. It also accept multiple chain function like `usecase.link(fnA, fnB, fnC)` or `usecase.link(fnA).link(fnB).link(fnC)`.

```js
// UseCase#link
const increment = compose('INCREMENT', {...}).link(resetChain)
```

`UseCase#next` implement chain. Chain functions are implemented async.

```js
// UseCase#next
emitter.on('USECASE:ACTION', (usecase, payload) => {
   usecase.next(getStatus, emit, payload);
});
```

Alx does not provide `store`. So you need to implement suitably `getStatus` function.

#### Pattern of UseCase

##### Omit actionType

```js
const usecase = compose({
	action: () => ({...}),
	reducer: () => ({...})
})
```

ActionType can omit. When omit actionType, `$type` of payload is `undefined` like `{ $type: undefined }` .

If you dont need `$type`, you omit actionType.

##### Omit action

```js
const usecase = compose('SOMETHING', {
	reducer: () => ({...})
})
```

When omit `action`, generated action automaticaly and return payload like a `{ $type: 'SOMETHING' }`.

`action` can omit, if all reducer(s) dont need payload or action do not have a specific value.

##### Omit reducer(s)

```js
const usecase = compose('SOMETHING', {
	action: () => ({...})
})
```

When omit `reducer(s)`, payload is published but status will not change.

This pattern is useful when You want only to link chain or want to publish event that dont change state for something.

## API

https://github.com/cotto89/alx/blob/master/docs/api.md

[api-link]:https://github.com/cotto89/alx/blob/master/docs/api.md