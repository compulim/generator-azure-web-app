'use strict';

const metaConfig = require('../config');
const express = require('express');
const parseURL = require('url').parse;
const WebpackDevServer = require('webpack-dev-server');

class DevServer {
  constructor(options) {
    this.options = options;
  }

  listen() {
    const webpackConfigurator = require('./webpackConfigurator')(require(metaConfig.SOURCE_WEBPACK_CONFIG_FILE));
    const { contentPath } = this.options;

    webpackConfigurator.setContentBase(contentPath);
    webpackConfigurator.enableSourceMap({ absolutePath: this.options.useAbsolutePath });
    this.options.writeToDisk && webpackConfigurator.enableWriteToDisk();
    this.options.hotModuleReplacement && webpackConfigurator.enableHotModuleReplacement(this.options.port);
    webpackConfigurator.enableSetup(app => {
      app
        .use('/api', require('./controllers/api')())
        .use(express.static(contentPath, { fallthrough: true, redirect: false }));
    });

    const webpackServer = new WebpackDevServer(
      webpackConfigurator.compiler(),
      webpackConfigurator.devServerConfig()
    );

    return new Promise((resolve, reject) => {
      webpackServer.listen(this.options.port, () => {
        console.info(`Webpack development server is up on port ${ this.options.port } with static content at ${ this.options.contentPath }`);
        resolve();
      });
    });
  }
}

module.exports = DevServer;