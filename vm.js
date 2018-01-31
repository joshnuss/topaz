const VM = {
  cpus: 8,
  schedulers: [],
  lastId: 0,
  actorMap: new Map(),

  start() {
    for (let i=0; i<VM.cpus; i++) {
      this.startScheduler(i);
    }
  },

  startScheduler(index) {
    const scheduler = new Worker('/scheduler.js');

    scheduler.postMessage({type: 'init', index});

    this.schedulers.push(scheduler);
  },

  spawn(...instructions) {
    const actor = this.createActor(instructions);
    const index = randomNumber(this.schedulers.length);
    const scheduler = this.schedulers[index];

    this.actorMap[actor.id] = index;

    return scheduler.postMessage({type: 'spawn', actor});
  },

  createActor(instructions) {
    this.lastId += 1;

    return {
      id: [0, this.lastId],
      code: instructions,
      reductions: 0,
      mailbox: [],
      links: [],
      monitors: [],
      blocked: false,
      terminated: false,
    }
  }
}

function randomNumber(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

VM.start();

VM.spawn(
  ['print', "I'm an actor"],
);

VM.spawn(
  ['print', 'Me 2'],
);

// VM.send(id, message)