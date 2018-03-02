# Topaz

A distributed actor-model virtual machine that runs in the browser & on the server.

## Setup

```
hub clone joshnuss/topaz
```

### Running on the server

```
yarn babel-node example.js
```

### Running in the browser

```
ruby -run -e httpd . -p 8000
open localhost:8000/examples
```

## How it works

### Schedulers

The VM contains multiple schedulers running in parallel (each one is a [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)). For example, a machine with 8 CPUs would have 8 schedulers.

### Spawning an Actor

Calling `VM.spawn(code)` creates a new actor object and places it on a random scheduler.

### Multitasking

The VM uses pre-emptive multitasking to time-slice the CPU.

Each scheduler has a "run queue", it pops actors off the queue, gives it 2000 iterations, pauses it and pushes it back to the end of the queue. It then pops the next actor and repeats in an endless loop. This ensures that no actor hogs the CPU.

### Linking

Actors can be linked to each other: When a linked actor terminates, every link is terminated as well. Links are bi-directional.

### Monitoring

An actor can monitor another: When a monitored actor terminates, all monitoring actors are notified about the termination. The notifcation is sent to their mailbox. Monitoring is uni-directional.

### Messaging

Actors can send & receive messages between each other. Sending is non-blocking, but receiving can block (when the mailbox is empty).

Sometimes, a message will need to go to an actor on different scheduler. In that case, it's routed thru the VM, which uses a [MessageChannel](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel) to notify the correct [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).

### Actor Object

Each actor is represented as a plain JavaScript `Object`. It contains the following data:

- `id: [nodeId, actorId]` an 2-cell array, first element is the node, second is the actor id
- `mailbox: []` an array of messages that are waiting to be processed.
- `waiting: true | false` true if `mailbox` is empty **and** the actor issued a `receive` call. Actors in waiting state are not executed until they receive a new message.
- `terminated: true | false` true when the actor has terminated. This happens when an error occurs or when an actor call the `exit` function. Actors in terminated state are never executed and will be culled.
- `links: []` an array of actor ids that are linked to this actor.
- `monitors: []` an array of actor ids that are monitoring this actor.
- `code: []` a list of operations (currently using s-expressions).
- `state: {}` contains the state data of the actor. Similar to `this` in JavaScript or `self` in Ruby.
- `reductions: integer` total number of statements processed.


## Examples

See [examples folder](examples)

## License

MIT
