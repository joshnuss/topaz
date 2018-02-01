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
}

class Interpreter {
  run(actor, operations) {
    for(let i=0; i<operations.length; i++) {
      const [operation, params] = operations[i];

      switch (operation) {
        case 'exit':
          actor.terminated = true;
          return;
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
      console.log(`[scheduler] ${scheduler.index} is online`);
      break;

    case 'spawn':
      scheduler.spawn(data.actor);
      console.log(`[scheduler] ${scheduler.index} spawned [${data.actor}]`);
      break;

    case 'terminate':
      scheduler.terminate(data.id);
      console.log(`[scheduler] ${scheduler.index} terminated [${data.id}]`);
      break;

    case 'send':
      scheduler.send(data.id, data.message);
      console.log(`[scheduler] ${scheduler.index} received "${data.message}" for [${data.id}]`);
      break;

    case 'link':
      scheduler.link(data.id, data.ids);
      console.log(`[scheduler] ${scheduler.index} is linking [${data.ids}] with [${data.id}]`);
      break;

    case 'monitor':
      scheduler.monitor(data.id, data.monitorId);
      console.log(`[scheduler] ${scheduler.index} is monitoring [${data.id}] for [${data.monitorId}]`);
      break;
  }
});

function work() {
  const actor = scheduler.runQueue.shift();

  if (actor) {
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
