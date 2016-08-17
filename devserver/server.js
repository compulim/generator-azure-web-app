'use strict';

const config = require('./config');

const
  deepAssign = require('deep-assign'),
  debug = require('debug'),
  express = require('express'),
  parseBool = require('../utils/parsebool'),
  parseURL = require('url').parse,
  webpack = require('webpack'),
  WebpackDevServer = require('webpack-dev-server');

class DevServer {
  listen() {
    const devWebpackConfig = deepAssign({}, require('./webpack.dev.config'));

    if (config.HOT_MODULE_REPLACEMENT) {
      devWebpackConfig.entry.unshift(
        `webpack-dev-server/client?http://0.0.0.0:${config.PORT}`,
        'webpack/hot/only-dev-server'
      );

      devWebpackConfig.devServer.hot = true;

      devWebpackConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin()
      );

      devWebpackConfig.module.loaders.forEach(loader => {
        devWebpackConfig.entry.some(entry => loader.test.test(entry)) && loader.loaders.unshift('react-hot')
      });
    } else {
      console.warn('Hot module replacement is switched off');
    }

    const webpackServer = new WebpackDevServer(
      webpack(devWebpackConfig),
      devWebpackConfig.devServer
    );

    webpackServer.app.use('/api', require('../prodserver/controllers/api')());

    webpackServer.app.use((req, res, next) => {
      const url = parseURL(req.url);

      if (/\/[\d\w]+$/.test(url.pathname)) {
        req.url = '/index.html';
      }

      next();
    });

    webpackServer.app.use(express.static(devWebpackConfig.devServer.contentBase, { fallthrough: true, redirect: false }));

    return new Promise((resolve, reject) => {
      webpackServer.listen(config.PORT, () => resolve({
        contentPath: devWebpackConfig.devServer.contentBase,
        port: config.PORT
      }));
    });
  }
}

function main() {
  return new DevServer();
}

module.exports = main;

const
  runningAsMain = require.main === module,
  runningUnderIISNode = process.env.iisnode_version;

(runningAsMain || runningUnderIISNode) && main().listen()
  .then(result => {
    console.info(`Webpack development server is up on port ${ result.port } with static content at ${ result.contentPath }`);
  }, err => {
    console.error('Failed to start webpack development server');
    console.error(err);
  });
