'use strict';

const config = require('../config');
const qs = require('qs');

const { basename, join } = require('path');

const BABEL_PLUGINS_FOR_IE8 = [
  'transform-es3-member-expression-literals',
  'transform-es3-property-literals',
  'transform-node-env-inline'
];

const BABEL_OPTIONS = {
  presets: ['react', 'es2015'],
  plugins: BABEL_PLUGINS_FOR_IE8
};

module.exports = {
  entry: [
    join(config.SOURCE_JS_DIR, 'index.js')
  ],
  output: {
    filename  : basename(config.DEST_WEBSITE_BUNDLE_FILE),
    path      : config.DEST_WEBPACK_DEV_DIR,
    publicPath: `/${ basename(config.DEST_WEBSITE_BUNDLE_DIR) }/`
  },
  module: {
    loaders: [{
      test   : /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loaders: [
        'react-hot-loader',
        'babel-loader?' + qs.stringify(BABEL_OPTIONS, { arrayFormat: 'brackets', encode: false })
      ]
    }, {
      test   : /\.js$/,
      include: /(node_modules|bower_components)/,
      loaders: [
        'babel-loader?' + qs.stringify({ plugins: BABEL_PLUGINS_FOR_IE8 }, { arrayFormat: 'brackets', encode: false })
      ]
    }]
  }
};
