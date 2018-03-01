const vm = new VM();
// spawn actor, prints "hello world" endlessly
vm.spawn(['print', 'hello world']);
