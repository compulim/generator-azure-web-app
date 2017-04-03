'use strict';

const program = require('commander');

function loadPackageJSON() {
  return require('./package.json');
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

module.exports = function () {
  program
    .version(loadPackageJSON().version)
    .option('-p, --port <port>', `Listens to specific port`);

  if (process.env.NODE_ENV === 'production') {
    program.option('-i, --content-path <path>', `Specifies the path to web content.`);
  } else {
    program.option('-h, --hot <hot>', `Toggles hot module replacement`, parseBool, true);
  }

  program.parse(process.argv);

  if (typeof program.contentPath === 'string') {
    process.env.APPSETTING_CONTENT_PATH = program.contentPath;
  }

  if (typeof program.hot === 'boolean') {
    process.env.APPSETTING_HOT_MODULE_REPLACEMENT = program.hot;
  }

  if (typeof program.port === 'string') {
    process.env.PORT = program.port;
  }
};
