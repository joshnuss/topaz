class Scheduler {
  constructor(index) {
    this.index = index;
    this.actors = new Map();
    this.runQueue = [];
  }

  spawn(actor) {
    this.actors[actor.id] == actor;
    this.runQueue.push(actor);

    return actor;
  }
}

class Interpreter {
  run(operations) {
    operations.forEach(([operation, params]) => {
      switch (operation) {
        case 'print':
          console.log(params);
          break;

        case 'loop':
          this.run(params);
          break;
      }
    });
  }
}

const maxReductions = 200;
const interpreter = new Interpreter();
const scheduler = new Scheduler();

this.addEventListener('message', ({data}) => {
  switch(data.type) {
    case 'init':
      scheduler.index = data.index;
      console.log(`[scheduler] ${scheduler.index} is online`);
      break;

    case 'spawn':
      const actor = scheduler.spawn(data.actor);
      console.log(`[scheduler] ${scheduler.index} spawned ${actor.id}`);
      break;
  }
});

function work() {
  const actor = scheduler.runQueue.shift();

  if (actor) {
    let reductions;

    for (reductions=0; reductions<maxReductions; reductions++) {
      interpreter.run(actor.code);
    }

    actor.reductions += reductions;

    if (!actor.terminated) {
      scheduler.runQueue.push(actor);
    }
  }

  setTimeout(work, 100);
}

work();
