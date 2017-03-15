'use strict';

const config = require('./appConfig');
const deepAssign = require('deep-assign');
const webpack = require('webpack');

class WebpackConfigurator {
  constructor(webpackConfig) {
    this._devServerConfig = {
      publicPath: webpackConfig.output.publicPath,
      stats: {
        colors: true
      }
    };

    this._webpackConfig = deepAssign({}, webpackConfig, { plugins: [] });
  }

  setContentBase(contentBase) {
    this._devServerConfig.contentBase = contentBase;
  }

  enableHotModuleReplacement(port = 80) {
    this._webpackConfig.entry.unshift(
      `webpack-dev-server/client?http://0.0.0.0:${ port }`,
      'webpack/hot/only-dev-server'
    );

    this._webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    this._webpackConfig.module.loaders.forEach(loader => {
      this._webpackConfig.entry.some(entry => loader.test.test(entry)) && loader.loaders.unshift('react-hot-loader')
    });

    this._devServerConfig.hot = true;
  }

  enableSourceMap(options = { absolutePath: true }) {
    this._webpackConfig.devtool = 'source-map';
    this._webpackConfig.output.pathinfo = true;

    if (options.absolutePath) {
      this._webpackConfig.output.devtoolModuleFilenameTemplate = 'file:///[absolute-resource-path]';
      this._webpackConfig.output.devtoolFallbackModuleFilenameTemplate = 'file:///[absolute-resource-path]?[hash]';
    }
  }

  enableWriteToDisk() {
    this._webpackConfig.plugins.unshift(new require('write-file-webpack-plugin')());
  }

  enableSetup(setupFn) {
    this._devServerConfig.setup = setupFn;
  }

  compiler() {
    return webpack(this._webpackConfig);
  }

  devServerConfig() {
    return this._devServerConfig;
  }
}

module.exports = webpackConfig => new WebpackConfigurator(webpackConfig);
