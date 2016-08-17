'use strict';

const deepAssign = require('deep-assign');
const cli = require('./config/cli');
const defaults = require('./config/defaults');
const environment = require('./config/environment');

const development = deepAssign({}, defaults, require('./config/development'), environment, cli);
const production = deepAssign({}, defaults, require('./config/production'), environment, cli);

const { node_env: nodeEnv } = process.env;

function getConfig(favor) {
  return favor === 'production' ? production : development;
}

module.exports = deepAssign(
  getConfig,
  getConfig(/^production$/i.test(process.env.node_env) ? 'production' : 'development')
);
