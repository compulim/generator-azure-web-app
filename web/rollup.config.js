'use strict';

const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const less = require('rollup-plugin-less');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');

module.exports['default'] = {
  dest: 'dist/bundle.js',
  entry: 'web/src/index.js',
  format: 'iife',
  plugins: [
    less({
      insert: true,
      output: css => css
    }),

    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        ['es2015', { modules: false }],
        'react'
      ],
      plugins: [
        'external-helpers',
        'transform-es3-member-expression-literals',
        'transform-es3-property-literals'
      ]
    }),

    commonjs({
      exclude: ['node_modules/process-es6/**'],

      include: [
        'node_modules/fbjs/**',
        'node_modules/object-assign/**',
        'node_modules/react/**',
        'node_modules/react-dom/**',
      ],

      namedExports: {
        react: ['Component', 'PropTypes'],
        'react-dom': ['render']
      }
    }),

    // TODO: Study why "transform-node-env-inline" is not working
    replace({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development') }),

    nodeResolve({
      browser: true,
      jsnext: true,
      main: true
    })
  ],
  sourceMap: false
};