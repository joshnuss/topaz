const native = {
  cpuCount: navigator.hardwareConcurrency,
  createScheduler: (index, onBubble) => {
    const scheduler = new Worker('../dist/scheduler.browser.js');
    const channel = new MessageChannel();
    const initMessage = {type: 'init', index, port: channel.port2};

    channel.port1.onmessage = (message) => onBubble(index, message.data);
    scheduler.postMessage(initMessage, [channel.port2]);

    return scheduler;
  }
};

export default native;
