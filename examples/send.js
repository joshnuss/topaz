const vm = new VM();

// spawn 2 actors
const pid1 = vm.spawn(
  ['print', 'hello'],
  ['receive'], // blocks
  ['print', 'world'], // prints after message is placed in mailbox
);

const pid2 = vm.spawn(
  ['print', 'yo'],
  ['send', pid1, 'sup'], // send pid1 a message which causes it to get unblocked
);
