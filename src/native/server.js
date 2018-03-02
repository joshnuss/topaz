import os from 'os';
import {Worker} from 'webworker-threads';

const native = {
  cpuCount: os.cpus().length,
  createScheduler: (index, onBubble) => {
    const worker = new Worker(function() {
      global.setTimeout = (cb, ms) => {
        return thread.nextTick(cb);
      };

      self.importScripts('dist/scheduler.server.js');
    });

    worker.onmessage = (event) => onBubble(index, event.data);

    const initMessage = {type: 'init', index};
    worker.postMessage(initMessage);

    return worker;
  }
};

export default native;
