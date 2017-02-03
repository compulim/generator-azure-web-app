'use strict';

const { cyan, green }       = require('colors');
const { relative, resolve } = require('path');
const gutil                 = require('gulp-util');

function formatIISParameters(iisParameters = {}) {
  return Object.keys(iisParameters)
    .map(key => `${ key }="${ iisParameters[key] }"`)
    .join(',');
}

function globIgnoreNodeModules(relativePath) {
  const absolutePath = resolve(__dirname, relativePath);

  return [
    `${ absolutePath }/**`,
    `!${ absolutePath }/**/{node_modules,node_modules/**}`,
    `!${ absolutePath }/**/.ntvs_analysis.dat`,
    `!${ absolutePath }/**/.vs`
  ];
}

function log(section, message) {
  gutil.log(`${ cyan(section) }:`, message);
}

function prettyPath(path) {
  return green(relative('.', path) || '.');
}

module.exports = {
  formatIISParameters,
  globIgnoreNodeModules,
  log,
  prettyPath
};
