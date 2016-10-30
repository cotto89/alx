# API
- [API](#api)
  * [`UseCase`](#usecase)
    + [`UseCase.initialize<TStatus>()`](#usecaseinitializetstatus)
      - [`compose<TActionArgs, TPayload>(options?: ComposeOption)`](#composetactionargs-tpayloadoptions-composeoption)
      - [`link<TActionArgs, TPayload>(compound: Compound, ...chain: Chain<TPayload>[])`](#linktactionargs-tpayloadcompound-compound-chain-chaintpayload)
      - [`clone<TActionArgs, TPayload>(compound: Compound<TStatus, TPayload, TActionArgs>, ...options: UseCaseOptions<TStatus, TPayload>[])`](#clonetactionargs-tpayloadcompound-compoundtstatus-tpayload-tactionargs-options-usecaseoptionststatus-tpayload)
    + [`UseCase#exec<TActionArgs>(actionArgs?: TActionArgs)`](#usecase%23exectactionargsactionargs-tactionargs)
    + [`UseCase#reduce(status: TStatus, payload: TPayload)`](#usecase%23reducestatus-tstatus-payload-tpayload)
    + [`UseCase#next(payload: TPayload, getStatus: Function, dispatch: Function): void`](#usecase%23nextpayload-tpayload-getstatus-function-dispatch-function-void)
  * [`Dispatcher`](#dispatcher)
    + [`Dipatcher#subscribe(event: "USECASE:ACTION" | "ERROR", listener)`](#dipatcher%23subscribeevent-usecaseaction--error-listener)
    + [`Dispatcher#dispatch(actionResult: any)`](#dispatcher%23dispatchactionresult-any)

## `UseCase`

### `UseCase.initialize<TStatus>()`

Initialize UseCase and return helper methods.

##### returns `compose()`, `link()`, `clone()`

#### example

```js
import { UseCase } from "alx"

interface Status {
	counter: { count: number }
}

const { compose, link, clone } = UseCase.initialize<Status>()
```

#### `compose<TActionArgs, TPayload>(options?: ComposeOption)`

Compose UseCase.

##### returns

`Compound<TStatus, TPayload, TActionArgs>`


##### type: `ComposeOptions`

```ts
type ComposeOptions<TStatus, TPayload> =
    ((usecase: UseCaseOptions<TStatus, TPayload>) => void)
    | UseCaseOptions<TStatus, TPayload>
```

##### type: `UseCaseOptions`

```ts
interface UseCaseOptions<TStatus, TPayload> {
    id?: string;
    action?: (...args: any[]) => any;
    reducer?: (status: TStatus, payload: TPayload) => TStatus;
    reducers?: {
        [context: string]: (state: any, payload: TPayload) => any;
    };
    chain?: Chain<TPayload> | Chain<TPayload>[];
}
```

##### type: `Compoud`

```ts
interface Compound<TStatus, TPayload, TActionArgs> {
    (actionArgs?: TActionArgs): Promise<{ payload: TPayload, usecase: UseCase<TStatus, TPayload> }>;
    usecase: UseCase<TStatus, TPayload>;
}
```

##### example

```ts
const increment = compose<number, {count: number}>((u) => {
	u.action = (count: number = 1) => ({ count });
	u.reducer = (status, payload) => ({
		counter: { count: status.counter.count + payload.count }
	})
})
```

#### `link<TActionArgs, TPayload>(compound: Compound, ...chain: Chain<TPayload>[])`

Attach chian function to target usecase.

##### returns

`Compound<TStatus, TPayload, TActionArgs>`

##### type Chain

```ts
type Chain<TPayload> = {
    ({payload, getStatus, dispatch }: {
        payload: TPayload,
        getStatus: Function,
        dispatch: Function
    }): any;
}
```

##### example

```ts
// usecase
const reset = compose((u) => {
	u.id = "RESET";
	u.reduer = () => ({ counter: { count: 0 } })
})

// chain function
funciton* resetChain({ getStatus, dispatch }) {
	const {count} = getStatus("counter");
	if (count > 100 || count < -100) {
		yield dispatch(reset())
	}
}

// attach chian
const incrementWithReset = link(increment, resetChain)

```


#### `clone<TActionArgs, TPayload>(compound: Compound<TStatus, TPayload, TActionArgs>, ...options: UseCaseOptions<TStatus, TPayload>[])`

Clone target usecase and merge options.

##### return

`Compound<TStatus, TPayload, TActionArgs>`

##### example

```ts
const increment2 = clone(increment, {
	id: "INCREMENT2"
})
```


### `UseCase#exec<TActionArgs>(actionArgs?: TActionArgs)`

Execute `usecase.action`.

##### Returns

`Promise<{ payload: TPayload; usecase: UseCase<TStatus, TPayload> }`


### `UseCase#reduce(status: TStatus, payload: TPayload)`

##### Returns

`TStatus`

### `UseCase#next(payload: TPayload, getStatus: Function, dispatch: Function): void`

-   **`getStatus`**: Alx does not provide store. So you need to implement suitably `getStatus` function.
-   **`dispatch`**: `Dispatcher#dispatch`



## `Dispatcher`

### `Dipatcher#subscribe(event: "USECASE:ACTION" | "ERROR", listener)`

##### returns

`unsubscribe: Function`

##### listener

###### `USECASE:ACTION`

```ts
listener: (result: { usecase: UseCase<TStatus, any>, payload: any;}) => any
```

###### `ERROR`

```ts
listener: (error: Error) => any
```

##### example

```ts
const { Dispatcher } from "alx";

const dispatcher = new Dispatcher<Status>();


// subscribe
const unsubscribe = dispatcher.subscribe("USECASE:ACTION", ({ usecase, payload }) => {
	...
})

// unsubscribe
unsubscribe();
```

### `Dispatcher#dispatch(actionResult: any)`

##### returns

```ts
 Promise<{ usecase: UseCase<TStatus, TPayload>, payload: TPayload }>
```




