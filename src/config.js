'use strict';

const deepAssign = require('deep-assign');

const CONFIGURATORS = [
  require('./configurators/defaults'),
  require('./configurators/environment'),
  require('./configurators/cli')
];

function getConfig(favor) {
  return CONFIGURATORS.reduce((config, configurator) => configurator(config, favor), {});
}

module.exports = deepAssign(
  getConfig,
  getConfig(/^production$/i.test(process.env.NODE_ENV) ? 'production' : 'development')
);
