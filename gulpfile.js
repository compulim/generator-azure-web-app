'use strict';

const
  config = require('./scripts/config'),
  gulp = require('gulp'),
  program = require('commander');

program
  .allowUnknownOption()
  .option('-b, --build <type>', 'Specifies the build type: "production", or "development". Will override NODE_ENV. (Default = "development")', /^(production|development)$/i, 'development')
  .option('--publishsettings <publish settings file>', 'Specifies the *.PublishSettings file for deployment')
  .parse(process.argv);

const build = (program.build || '').toLowerCase();

switch (build) {
case 'production':
case 'development':
  process.env.node_env = build;
  break;
}

if (program.publishsettings) {
  config.DEPLOY_PUBLISH_SETTINGS = program.publishsettings;
}

require('./scripts/build')(gulp);
require('./scripts/clean')(gulp);
require('./scripts/deploy')(gulp);
require('./scripts/pack')(gulp);
