import Interpreter from './interpreter';

const maxReductions = 200;

export default class Scheduler {
  constructor() {
    this.actors = new Map();
    this.runQueue = [];
    this.interpreter = new Interpreter(this);
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
      this.bubble('send', {id: actorId, message});
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

    if (actor.terminated) return false;

    actor.terminated = true;

    this.bubble('terminated', {id, links, monitors});

    return true;
  }

  log(message, ...args) {
    console.log(`[scheduler:${this.index}]: ${message}`, ...args);
  }

  bubble(type, message) {
    const payload = {type, ...message};

    if (this.port)
      this.port.postMessage(payload);
    else
      postMessage(payload);
  }

  onMessage = ({data}) => {
    let actor;

    switch(data.type) {
      case 'init':
        this.index = data.index;
        this.port = data.port;

        this.log('is online');
        break;

      case 'spawn':
        this.spawn(data.actor);
        this.log(`spawned [${data.actor.id}]`);
        break;

      case 'terminate':
        if (this.terminate(data.id)) {
          this.log(`terminated [${data.id}]`);
        } else {
          this.log(`already terminated [${data.id}]`);
        }
        break;

      case 'send':
        this.send(data.id, data.message);
        this.log(`[${data.id}] recieved`, data.message);
        break;

      case 'link':
        this.link(data.id, data.ids);
        this.log(`is linking ${data.ids.map(id => `[${id}]`).join(', ')} with [${data.id}]`);
        break;

      case 'monitor':
        this.monitor(data.id, data.monitorId);
        this.log(`is monitoring [${data.id}] for [${data.monitorId}]`);
        break;

      default:
        this.log(`got unknown message ${data}`);
        break;
    }
  }

  loop() {
    const actor = this.runQueue.shift();

    if (actor && !actor.terminated) {
      let reductions;

      for (reductions=0; reductions<maxReductions; reductions++) {
        this.interpreter.run(actor, actor.code);

        if (actor.terminated || actor.waiting)
          break;
      }

      actor.reductions += reductions;

      if (actor.terminated) {
        this.terminate(actor.id);
      } else {
        this.runQueue.push(actor);
      }
    }

    setTimeout(this.loop.bind(this), 1000);
  }
}

const scheduler = new Scheduler();

onmessage = scheduler.onMessage;

scheduler.loop();
