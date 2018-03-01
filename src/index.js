const nodes = new Map();

export default class VM {
  static spawn(node, code) {
    nodes[node].spawn(code);
  }

  static terminate([node, id]) {
    nodes[node].terminate([node, id]);
  }

  static send([node, id], message) {
    nodes[node].send([node, id], message);
  }

  static link(...ids) {
    ids.forEach(([node, id]) => {
      const vm = nodes[node];
      const filtered = ids.filter(x => x.toString() !== [node, id].toString());

      vm.link([node, id], ...filtered);
    });
  }

  static monitor([node, id], ...ids) {
    nodes[node].monitor([0, id], ids);
  }

  constructor(name = 0) {
    this.name = name;
    this.schedulers = [];
    this.lastId = 0;
    this.actorMap = new Map();

    nodes[name] = this;

    for (let i=0; i<navigator.hardwareConcurrency; i++) {
      this.startScheduler(i);
    }
  }

  startScheduler(index) {
    const scheduler = new Worker('../dist/scheduler.browser.js');
    const channel = new MessageChannel();
    const port = channel.port2;

    channel.port1.onmessage = (message) => this.onmessage(index, message.data);
    scheduler.postMessage({type: 'init', index, port}, [port]);

    this.schedulers.push(scheduler);
  }

  spawn(...instructions) {
    const actor = this.createActor(instructions);
    const index = randomNumber(this.schedulers.length);
    const scheduler = this.schedulers[index];

    this.actorMap[actor.id] = index;

    scheduler.postMessage({type: 'spawn', actor});

    return actor.id;
  }

  send(id, message) {
    this.notifyScheduler(id, 'send', {message})
  }

  link(...ids) {
    ids.forEach(([node, id]) => {
      if (node == this.name) {
        this.notifyScheduler([node, id], 'link', {ids: ids.filter(x => x !== id)});
      }
    });
  }

  monitor(monitorId, ...ids) {
    ids.forEach(id => {
      this.notifyScheduler(id, 'monitor', {monitorId});
    });
  }

  terminate(id) {
    this.notifyScheduler(id, 'terminate');
  }

  notifyScheduler(id, type, message) {
    const schedulerIndex = this.actorMap[id];

    if (schedulerIndex == 'terminated')
      return;

    if (!schedulerIndex) {
      throw new Error(`vm:${this.name}: unknown actor ${id}`);
    }

    const scheduler = this.schedulers[schedulerIndex];

    scheduler.postMessage({type, id, ...message});
  }

  createActor(instructions) {
    this.lastId += 1;

    return {
      id: [this.name, this.lastId],
      code: instructions,
      reductions: 0,
      mailbox: [],
      state: {},
      links: [],
      monitors: [],
      waiting: false,
      terminated: false,
    };
  }

  onmessage(from, message) {
    switch (message.type) {
      case 'send':
        VM.send(message.id, message.message);

        break;
      case 'terminated':
        const {id, links, monitors} = message;

        this.actorMap[id] = 'terminated';

        links.forEach(linked => VM.terminate(linked));
        monitors.forEach(monitoring => VM.send(monitoring, {message: 'down', id}));
        break;
      default:
        console.log(`[vm:${this.name}] received unexpected message:`, message);
        break;
    }
  }
}

function randomNumber(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
