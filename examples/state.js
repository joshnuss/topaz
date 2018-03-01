const vm = new VM();

// spawn an actor
const pid = vm.spawn(
  ['increment', 'transactions'],
  ['increment', 'transactions', 22]
);

// after 3 seconds, terminate one actor, which causes other (linked actor) to terminate as well
setTimeout(() => VM.terminate(pid), 3000);
