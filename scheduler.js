class Scheduler {
  constructor(index) {
    this.index = index;
    this.actors = new Map();
    this.runQueue = [];
  }

  spawn(actor) {
    this.actors[actor.id] = actor;
    this.runQueue.push(actor);

    return actor;
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
      actor = scheduler.spawn(data.actor);
      console.log(`[scheduler] ${scheduler.index} spawned ${actor.id}`);
      break;

    case 'send':
      actor = scheduler.actors[data.id];
      actor.mailbox.push(data.message);
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

    if (!actor.terminated) {
      scheduler.runQueue.push(actor);
    }
  }

  setTimeout(work, 1000);
}

work();
