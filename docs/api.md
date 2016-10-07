# API

* [`UseCase`](#usecase)
	+ [`UseCase.compose(actionType, options)`](#usecasecomposeactiontype-options)
	+ [`UseCase.clone(usecase, ...options)`](#usecasecloneusecase-options)
	+ [`UseCase#link(...chain)`](#usecaselinkchain)
	+ [`UseCase#exec(...actionArgs)`](#usecaseexecactionargs)
	+ [`UseCase#reduce(status, payload)`](#usecasereducestatus-payload)
	+ [`UseCase#next(payload, getStatus, emit)`](#usecasenextpayload-getstatus-emit)
* [`ActionEmitter`](#actionemitter)
	+ [`ActionEmitter#emit(usecase, actionArgs)`](#actionemitteremitusecase-actionargs)
	+ [`ActionEitter#on(event, callback)`](#actioneitteronevent-callback)

## `UseCase`

### `UseCase.compose(actionType, options)`

Create an instance of `UseCase`. This is alias of `UseCase` constructor.

| args               | type                  | required |
| ------------------ | --------------------- | -------- |
| `actionType`       | `string`              |          |
| `options.action`   | `Function`            |          |
| `options.reducer`  | `Function`            |          |
| `options.reducers` | `Object`              |          |
| `options.chain`    | `Function|Function[]` |          |

-   **`actionType`** became a `payload.$type`
-   **`options.action`** must return payload. Payload must be plain object.
-   **`options.reducer`** must be synchronously implementation. Return completed status as next status.
-   **`options.reducers`** must be synchronously. It have only to return own context state as next state on context.
-   **`options.chain`** is implemented synchronously.

**Return:** instance of `UseCase`.

### `UseCase.clone(usecase, ...options)`

Clone `usecase`.

| args      | type      | required |
| --------- | --------- | -------- |
| `usecase` | `UseCase` | true     |
| `options` | `Object`  |          |

-   **`usecase`** is instance of `UseCase`
-   **`options`** is the same of `UseCase.compose`

**Return**: instance of UseCase.

### `UseCase#link(...chain)`

Link chain to usecase. usecase is cloned.

| args    | type       | required |
| ------- | ---------- | -------- |
| `chain` | `Function` | true     |

**Return:** instance of `UseCase`.

### `UseCase#exec(...actionArgs)`

Implement `usecase.action`.

| args         | type  | required |
| ------------ | ----- | -------- |
| `actionArgs` | `any` |          |

**Return:** `Promise { payload }`

### `UseCase#reduce(status, payload)`

Implement `usecase.reducer(s)`.

| args      | type     | required |
| --------- | -------- | -------- |
| `status`  | `Object` | true     |
| `payload` | `Object` | true     |

**Return:** `Object` as nextStatus.

### `UseCase#next(payload, getStatus, emit)`

Implement `usecase.chain`. Chain functions are implemented asynchronously.

| args        | type       | required |
| ----------- | ---------- | -------- |
| `payload`   | `Object`   | true     |
| `getStatus` | `Function` | true     |
| `emit`      | `Function` | true     |

-   **`getStatus`**: Alx does not provide store. So you need to implement suitably `getStatus` function.
-   **`emit`**: `ActionEmitter#emit`

## `ActionEmitter`

### `ActionEmitter#emit(usecase, actionArgs)`

Impliment `UseCase#exec` and publish `USECASE:ACTION` or `ERROR`.

| args         | type      | required |
| ------------ | --------- | -------- |
| `usecase`    | `UseCase` | true     |
| `actionArgs` | `any`     |          |

**Return**: `Promise{ usecase, payload }`

### `ActionEitter#on(event, callback)`

Subscribe `USECASE:ACTION` or `ERROR` event.

| args       | type       | required |
| ---------- | ---------- | -------- |
| `event`    | `string`   | true     |
| `callback` | `Function` |          |

#### callback arguments

##### `USECASE:ACTION`

| args      | type      |
| --------- | --------- |
| `usecase` | `UseCase` |
| `payload` | `Object`  |

##### `ERROR`

| args    | type    |
| ------- | ------- |
| `error` | `Error` |

ActionEmitter is extened [EventEmitter][link:eventemitter]. If you want to more API infomation, See <https://nodejs.org/api/events.html>

[link:eventemitter]: https://nodejs.org/api/events.html



