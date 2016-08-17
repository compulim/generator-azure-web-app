'use strict';

const config = require('./config');

const
  deepAssign = require('deep-assign'),
  path = require('path'),
  webpack = require('webpack'),
  webpackConfig = require('../web/webpack.config.js');

module.exports = deepAssign(
  {},
  webpackConfig,
  {
    devServer: {
      contentBase: config.CONTENT_PATH,
      outputPath: webpackConfig.output.path,
      publicPath: webpackConfig.output.publicPath,
      stats: {
        colors: true
      }
    },
    devtool: 'source-map',
    output: Object.assign(
      { pathinfo: true },
      config.USE_ABSOLUTE_PATH ?
        {
          devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',
          devtoolFallbackModuleFilenameTemplate: 'file:///[absolute-resource-path]?[hash]',
        } : {}
    ),
    plugins: [
      config.WRITE_TO_DISK ? new require('write-file-webpack-plugin')() : null
    ].concat(webpackConfig.plugins || [])
  }
);
