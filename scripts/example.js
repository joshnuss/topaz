import fs from 'fs';
import VM from '../src/vm.js';

global.VM = VM;

const file = process.argv[2];
const code = fs.readFileSync(file, 'utf8');

console.log(code);

eval(code);
