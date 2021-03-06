const node0 = new VM(0);
const node1 = new VM(1);

// spawn 2 actors
const pid1 = node0.spawn(
  ['print', 'hello'],
  ['receive'], // blocks
  ['print', 'world'], // prints after message is placed in mailbox
);

const pid2 = node1.spawn(
  ['print', 'yo'],
  ['send', pid1, 'sup'], // send pid1 a message which causes it to get unblocked
);

console.log(pid1, pid2)
