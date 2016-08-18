'use strict';

const path = require('path');

const PUBLIC_PATH = 'dist/';
const OUTPUT_PATH = path.resolve(__dirname, '../dist/webpack/', PUBLIC_PATH);

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
    path.join(__dirname, 'src/index.js')
  ],
  output: {
    filename: 'bundle.js',
    path: OUTPUT_PATH,
    publicPath: `/${ PUBLIC_PATH }`
  },
  module: {
    loaders: [
      {
        test: /\.(c|le)ss$/,
        loader: 'style!css!less'
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: [
          'babel' + babelOptions(BABEL_OPTIONS)
        ]
      }
    ]
  }
};

function babelOptions(options) {
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
