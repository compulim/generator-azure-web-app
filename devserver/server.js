'use strict';

const config = require('./config');

const
  deepAssign = require('deep-assign'),
  debug = require('debug'),
  express = require('express'),
  parseURL = require('url').parse,
  webpack = require('webpack'),
  WebpackDevServer = require('webpack-dev-server');

class DevServer {
  listen() {
    const configurator = require('./webpackConfigurator')(require('../web/webpack.config.js'));
    const contentPath = config.CONTENT_PATH;

    configurator.setContentBase(contentPath);
    configurator.enableSourceMap({ absolutePath: config.USE_ABSOLUTE_PATH });
    config.WRITE_TO_DISK && configurator.enableWriteToDisk();
    config.HOT_MODULE_REPLACEMENT && configurator.enableHotModuleReplacement(config.PORT);
    configurator.enableSetup(app => {
      app.use('/api', require('../prodserver/controllers/api')());

      app.use((req, res, next) => {
        const url = parseURL(req.url);

        if (/\/[\d\w]+$/.test(url.pathname)) {
          req.url = '/index.html';
        }

        next();
      });

      app.use(express.static(contentPath, { fallthrough: true, redirect: false }));
    });

    const webpackServer = new WebpackDevServer(
      configurator.compiler(),
      configurator.devServerConfig()
    );

    return new Promise((resolve, reject) => {
      webpackServer.listen(config.PORT, () => resolve({
        contentPath,
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
