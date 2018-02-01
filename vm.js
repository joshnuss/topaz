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
    const channel = new MessageChannel();
    const port = channel.port2;

    channel.port1.onmessage = (message) => this.onmessage(index, message.data);
    scheduler.postMessage({type: 'init', index, port}, [port]);

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
  },

  notifyScheduler(id, type, message) {
    const schedulerIndex = this.actorMap[id];

    if (schedulerIndex == 'terminated')
      return;

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
  },

  onmessage(from, message) {
    switch (message.type) {
      case 'terminated':
        const {id, links, monitors} = message;

        VM.actorMap[id] = 'terminated';

        links.forEach(linked => VM.terminate(linked));
        monitors.forEach(monitoring => VM.send(monitoring, {message: 'down', id}));
        break;
      default:
        console.log(`[vm] received unexpected message:`, message);
        break;
    }
  }
}

function randomNumber(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

VM.start();

window.VM = VM;
