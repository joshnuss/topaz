class Scheduler {
  constructor() {
    this.actors = new Map();
    this.runQueue = [];
  }

  spawn(actor) {
    this.actors[actor.id] = actor;
    this.runQueue.push(actor);
  }

  send(actorId, message) {
    const actor = this.actors[actorId];

    if (actor) {
      actor.mailbox.push(message);
      actor.waiting = false;
    } else {
      bubble('send', {id: actorId, message});
    }
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
    const {id, links, monitors} = actor;

    actor.terminated = true;

    this.bubble('terminated', {id, links, monitors});
  }

  log(message, ...args) {
    console.log(`[scheduler:${this.index}]: ${message}`, ...args);
  }

  bubble(type, message) {
    this.port.postMessage({type, ...message});
  }
}

class Interpreter {
  run(actor, operations) {
    for(let i=0; i<operations.length; i++) {
      const [operation, params] = operations[i];

      switch (operation) {
        case 'exit':
          scheduler.terminate(actor.id);
          return;

        case 'receive':
          if (actor.mailbox.length) {
            const message = actor.mailbox.pop();

            scheduler.log(`[${actor.id}]: received`, message);
          } else {
            actor.waiting = true;
            return;
          }
          break;

        case 'print':
          scheduler.log(`[${actor.id}]: ${params}`);
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
      scheduler.port = data.port;

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
      scheduler.log(`[${data.id}] recieved`, data.message);
      break;

    case 'link':
      scheduler.link(data.id, data.ids);
      scheduler.log(`is linking [${data.ids}] with [${data.id}]`);
      break;

    case 'monitor':
      scheduler.monitor(data.id, data.monitorId);
      scheduler.log(`is monitoring [${data.id}] for [${data.monitorId}]`);
      break;

    default:
      scheduler.log(`got unknown message ${data}`);
      break;
  }
});

function work() {
  const actor = scheduler.runQueue.shift();

  if (actor && !actor.terminated) {
    let reductions;

    for (reductions=0; reductions<maxReductions; reductions++) {
      interpreter.run(actor, actor.code);

      if (actor.terminated || actor.waiting)
        break;
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
