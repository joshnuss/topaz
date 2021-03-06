const vm = new VM();

// spawn 2 actors
const pid1 = vm.spawn(['print', 'hello']);
const pid2 = vm.spawn(['print', 'world'], ['receive']);

// pid2 monitors pid1
VM.monitor(pid2, pid1);

// after 3 seconds, terminate one actor, which causes other (monitoring actor) to receive a notification message 
setTimeout(() => VM.terminate(pid1), 3000);
