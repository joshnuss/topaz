const vm = new VM();

// spawn 2 actors
const pid1 = vm.spawn(['print', 'hello']);
const pid2 = vm.spawn(['print', 'world']);

// link them together
VM.link(pid1, pid2);

// after 3 seconds, terminate one actor, which causes other (linked actor) to terminate as well
setTimeout(() => VM.terminate(pid2), 3000);
