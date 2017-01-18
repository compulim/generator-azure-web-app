'use strict';

const program = require('commander');

function loadPackageJSON() {
  try {
    return require('../package.json');
  } catch (err) {
    return require('../../package.json');
  }
}

function parseBool(value) {
  if (value) {
    value = value.toLowerCase();

    switch (value) {
    case 'on':
    case 'true':
    case 'yes':
      return true;

    case 'false':
    case 'off':
    case 'no':
      return false;
    }

    return;
  } else {
    return value;
  }
}

module.exports = function (config, favor) {
  program
    .version(loadPackageJSON().version)
    .option('-p, --port <port>', `Listens to specific port (default = ${ config.PORT })`);

  if (favor === 'production') {
    program.option('-i, --content-path <path>', `Specifies the path to web content (default = ${ config.CONTENT_PATH }).`);
  } else {
    program.option('-h, --hot <hot>', `Toggles hot module replacement (default = ${ config.HOT_MODULE_REPLACEMENT })`, parseBool, true);
  }

  program.parse(process.argv);

  if (typeof program.contentPath === 'string') {
    config.CONTENT_PATH = program.contentPath;
  }

  if (typeof program.hot === 'string') {
    config.HOT_MODULE_REPLACEMENT = program.hot;
  }

  if (typeof program.port === 'string') {
    config.PORT = program.port;
  }

  return config;
}