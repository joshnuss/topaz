const vm = new VM();

// spawn actor
const pid = vm.spawn(
  ['print', 'hello'],
  ['receive'], // blocks
  ['print', 'world'], // prints after message is placed in mailbox
);

// after 3 seconds, send actor message "yo"
setTimeout(() => VM.send(pid, "yo"), 3000);
