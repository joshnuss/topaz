export default class Interpreter {
  constructor(scheduler) {
    this.scheduler = scheduler;
  }

  run(actor, operations) {
    for(let i=0; i<operations.length; i++) {
      const [operation, ...params] = operations[i];

      switch (operation) {
        case 'exit':
          this.scheduler.terminate(actor.id);
          return;

        case 'receive':
          if (actor.mailbox.length) {
            const message = actor.mailbox.pop();

            this.scheduler.log(`[${actor.id}]: received`, message);
          } else {
            actor.waiting = true;
            return;
          }
          break;

        case 'send':
          const [pid, message] = params;
          this.scheduler.send(pid, message);
          this.scheduler.log(`[${actor.id}]: sent [${pid}]`, message);
          break;

        case 'increment':
          const key = params[0];
          const by = params.length > 1 ? params[1] : 1;
          actor.state[key] += by;
          this.scheduler.log(`[${actor.id}]: increment ${key} by ${by}`);
          break;

        case 'print':
          this.scheduler.log(`[${actor.id}]: ${params}`);
          break;

        case 'loop':
          this.run(actor, ...params);
          break;
      }
    };
  }
}

