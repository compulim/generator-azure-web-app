'use strict';

const packageJSON = require('../../package.json');
const parseBool = require('../../utils/parsebool');
const program = require('commander');

program
  .version(packageJSON.version)
  .option('-h, --hot <hot>', 'Toggles hot module replacement (default = true)', parseBool, true)
  .option('-p, --port <port>', 'Listens to specific port (default = 80)')
  .parse(process.argv);

module.exports = {
  HOT_MODULE_REPLACEMENT: program.hot,
  PORT: program.port
};
