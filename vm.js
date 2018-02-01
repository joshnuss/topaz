const VM = {
  cpus: navigator.hardwareConcurrency,
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

    scheduler.postMessage({type: 'spawn', actor});

    return actor.id;
  },

  send(id, message) {
    this.notifyScheduler(id, 'send', {message})
  },

  link(...ids) {
    ids.forEach(id => {
      this.notifyScheduler(id, 'link', {ids: ids.filter(x => x !== id)});
    });
  },

  monitor(monitorId, ...ids) {
    ids.forEach(id => {
      this.notifyScheduler(id, 'monitor', {monitorId});
    });
  },

  terminate(id) {
    this.notifyScheduler(id, 'terminate');
    delete this.actorMap[id];
  },

  notifyScheduler(id, type, message) {
    const schedulerIndex = this.actorMap[id];

    if (!schedulerIndex)
      throw new Error(`vm: unknown actor ${id}`);

    const scheduler = this.schedulers[schedulerIndex];

    scheduler.postMessage({type, id, ...message});
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
      waiting: false,
      terminated: false,
    };
  }
}

function randomNumber(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

VM.start();

const pid1 = VM.spawn(
  ['print', "I'm an actor"],
  ['exit'],
  ['print', "Unreachable"],
);

const pid2 = VM.spawn(
  ['print', 'Me 2'],
);

const pid3 = VM.spawn(
  ['print', 'hello'],
  ['receive'],
  ['print', 'got first message'],
  ['receive'],
  ['print', 'got second message'],
);

VM.link(pid1, pid2);
VM.monitor(pid1, pid3);

setTimeout(() => VM.terminate(pid2), 5500);
setTimeout(() => VM.send(pid3, 'a message'), 5600);
