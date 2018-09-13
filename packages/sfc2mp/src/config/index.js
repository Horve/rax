const webpack = require('webpack');
const { resolve } = require('path');
const { existsSync } = require('fs');
const merge = require('webpack-merge');
const log = require('fancy-log');
const vendorPaths = require('../utils/vendors');
const { getAppJSON } = require('../utils');

const ManifestPlugin = require('../plugin/manifest');

const appLoader = require.resolve('../loader/app');
const pageLoader = require.resolve('../loader/page');

const baseConfig = {
  mode: 'development',
  devtool: false,
  resolve: {
    alias: {
      'webpack-hot-client/client': require.resolve('webpack-hot-client/client'),
    },
    extensions: ['.js', '.json', '.html', 'vue'],
  },
};

// helper assets
const vendorConfig = {
  mode: 'development',
  entry: {
    'assets/vendor/transAppConfig': vendorPaths.transAppConfig,
    'assets/vendor/transPageConfig': vendorPaths.transPageConfig,
    'assets/vendor/coreApp': vendorPaths.coreApp,
    'assets/vendor/vue': require.resolve('vue/dist/vue.runtime.common')
  },
  output: {
    libraryTarget: 'commonjs2'
  },
  node: {
    global: false
  },
  externals: {
    'vue': 'commonjs2 /assets/vendor/vue',
  },
  devtool: false,
  plugins: [
    // vue need to access global.process.env.VUE_ENV
    new webpack.DefinePlugin({
      'global.process.env.VUE_ENV': 'browser'
    })
  ]
};

/**
 * getWebpackConfig
 * @param {String} rootDir
 */
module.exports = function getWebpackConfig(rootDir) {
  const appJSON = getAppJSON(rootDir);
  return new Promise((done) => {
    const entry = getEntry(rootDir, appJSON);
    const context = resolve(rootDir, appJSON.root || '');

    const config = merge(baseConfig, {
      entry,
      context,
      // external all
      externals: [
        function(context, request, callback) {
          if (/^.?\/assets/.test(request)) {
            return callback(null, `commonjs2 ${request}`);
          }
          callback();
        }
      ],
      resolve: {
        alias: {
          '@': context,
        }
      }
    });

    done([vendorConfig, config]);
  });
};

function getEntry(rootDir, appJSON = {}) {
  const appPath = resolve(rootDir, appJSON.root || '', 'app.js');
  if (!existsSync(appPath)) {
    throw new Error('app.js not exists');
  }

  const entry = {
    'app': appLoader + '!' + appPath,
  };

  if (Array.isArray(appJSON.pages)) {
    log('Page List:', appJSON.pages);
    appJSON.pages.forEach((pagePath) => {
      entry[pagePath] = pageLoader
        + `?pageName=${pagePath}!`
        + resolve(rootDir, appJSON.root || '', pagePath + '.html');
    });
  }

  return entry;
}
