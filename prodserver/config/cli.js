'use strict';

let packageJSON;

try {
  packageJSON = require('../../package.json');
} catch (err) {
  packageJSON = require('../package.json');
}

const program = require('commander');

program
  .version(packageJSON.version)
  .option('-i, --content-path <path>', 'Specifies the path to web content (default = ./public).')
  .option('-p, --port <port>', 'Listens to specific port (default = 80)')
  .parse(process.argv);

module.exports = {
  CONTENT_PATH: program.contentPath,
  PORT: program.port
};
