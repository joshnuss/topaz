const path = require('path');

const defaultConfig = {
  devtool: 'inline-source-map'
};

const serverConfig = {
  vm: {
    ...defaultConfig,
    target: 'node',
    resolve: {
      alias: {
        'native': path.resolve(__dirname, 'src/native/server')
      },
    },
    output: {
      library: 'VM',
      libraryTarget: 'commonjs2',
      path: path.resolve(__dirname, 'dist'),
      filename: 'vm.server.js'
    }
  },
  scheduler: {
    ...defaultConfig,
    target: 'node',
    entry: './src/scheduler',
    output: {
      library: 'scheduler',
      path: path.resolve(__dirname, 'dist'),
      filename: 'scheduler.server.js'
    }
  }
};

const clientConfig = {
  vm: {
    ...defaultConfig,
    target: 'web',
    resolve: {
      alias: {
        'native': path.resolve(__dirname, 'src/native/browser')
      },
    },
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

module.exports = [
  serverConfig.scheduler,
  clientConfig.scheduler,
  clientConfig.vm,
];
