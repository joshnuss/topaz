const vm0 = new VM(0);
const vm1 = new VM(1);

// spawn 2 actors on different nodes
const pid1 = vm0.spawn(['print', 'hello']);
const pid2 = vm1.spawn(['print', 'world']);

// link them together
VM.link(pid1, pid2);

// after 3 seconds, terminate one actor, which causes other (linked actor) to terminate as well
setTimeout(() => VM.terminate(pid2), 3000);
