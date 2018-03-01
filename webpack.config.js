const path = require('path');

const defaultConfig = {
  devtool: 'inline-source-map'
};

const serverConfig = {
  ...defaultConfig,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vm.server.js'
  },
};

const clientConfig = {
  vm: {
    ...defaultConfig,
    target: 'web',
    output: {
      library: 'VM',
      libraryExport: 'default',
      path: path.resolve(__dirname, 'dist'),
      filename: 'vm.browser.js'
    }
  },
  scheduler: {
    ...defaultConfig,
    target: 'web',
    entry: './src/scheduler',
    output: {
      library: 'scheduler',
      path: path.resolve(__dirname, 'dist'),
      filename: 'scheduler.browser.js'
    }
  }
};

module.exports = [serverConfig, clientConfig.vm, clientConfig.scheduler];
