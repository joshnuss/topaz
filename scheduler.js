class Scheduler {
  constructor(index) {
    this.index = index;
    this.actors = new Map();
    this.runQueue = [];
  }

  spawn(actor) {
    this.actors[actor.id] = actor;
    this.runQueue.push(actor);
  }

  send(actorId, message) {
    const actor = this.actors[actorId];

    actor.mailbox.push(message);
    actor.waiting = false;
  }

  link(actorId, ids) {
    const actor = this.actors[actorId];

    ids.forEach(id => actor.links.push(id));
  }

  monitor(actorId, monitorId) {
    const actor = this.actors[actorId];

    actor.monitors.push(monitorId);
  }

  terminate(actorId) {
    const actor = this.actors[actorId];

    actor.terminated = true;
    actor.links.forEach(id => {
      // terminate link
    });

    actor.monitors.forEach(id => {
      // notify monitor
    });
  }

  log(message) {
    console.log(`[scheduler:${this.index}]: ${message}`);
  }
}

class Interpreter {
  run(actor, operations) {
    for(let i=0; i<operations.length; i++) {
      const [operation, params] = operations[i];

      switch (operation) {
        case 'exit':
          actor.terminated = true;
          return;

        case 'receive':
          if (actor.mailbox.length) {
            const message = actor.mailbox.pop();

            console.log(`received ${message}`);
          } else {
            actor.waiting = true;
            return;
          }
          break;

        case 'print':
          console.log(params);
          break;

        case 'loop':
          this.run(actor, params);
          break;
      }
    };
  }
}

const maxReductions = 200;
const interpreter = new Interpreter();
const scheduler = new Scheduler();

this.addEventListener('message', ({data}) => {
  let actor;

  switch(data.type) {
    case 'init':
      scheduler.index = data.index;
      scheduler.log('is online');
      break;

    case 'spawn':
      scheduler.spawn(data.actor);
      scheduler.log(`spawned [${data.actor.id}]`);
      break;

    case 'terminate':
      scheduler.terminate(data.id);
      scheduler.log(`terminated [${data.id}]`);
      break;

    case 'send':
      scheduler.send(data.id, data.message);
      scheduler.log(`received "${data.message}" for [${data.id}]`);
      break;

    case 'link':
      scheduler.link(data.id, data.ids);
      scheduler.log(`is linking [${data.ids}] with [${data.id}]`);
      break;

    case 'monitor':
      scheduler.monitor(data.id, data.monitorId);
      scheduler.log(`is monitoring [${data.id}] for [${data.monitorId}]`);
      break;
  }
});

function work() {
  const actor = scheduler.runQueue.shift();

  if (actor && !actor.terminated) {
    let reductions;

    for (reductions=0; reductions<maxReductions; reductions++) {
      interpreter.run(actor, actor.code);
    }

    actor.reductions += reductions;

    if (actor.terminated) {
      scheduler.terminate(actor.id);
    } else {
      scheduler.runQueue.push(actor);
    }
  }

  setTimeout(work, 1000);
}

work();
