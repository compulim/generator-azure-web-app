'use strict';

const config = require('../config');

const { basename, join } = require('path');

const
  BABEL_OPTIONS = {
    presets: ['react', 'es2015'],
    plugins: [
      'transform-es3-member-expression-literals',
      'transform-es3-property-literals',
      'transform-node-env-inline'
    ]
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
    loaders: [
      {
        test  : /\.(c|le)ss$/,
        loader: 'style!css!less'
      },
      {
        test   : /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: [
          'babel' + babelOptions(BABEL_OPTIONS)
        ]
      }
    ]
  }
};

function babelOptions(options) {
  // TODO: Can we replace this with qs?

  const pairs = [];

  Object.keys(options).forEach(name => {
    const value = options[name];

    if (Array.isArray(value)) {
      value.forEach(item => {
        pairs.push(`${ name }[]=${ item }`);
      });
    } else {
      pairs.push(`${ name }=${ value }`);
    }
  });

  return '?' + pairs.join('&');
}
