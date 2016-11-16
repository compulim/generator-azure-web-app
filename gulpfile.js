'use strict';

const
  config = require('./scripts/config'),
  gulp = require('gulp'),
  program = require('commander');

const currentBundler = process.env.BUNDLER === 'webpack' ? 'webpack' : 'rollup';
const currentFavor = process.env.NODE_ENV === 'development' ? 'development' : 'production';

program
  .allowUnknownOption()
  .option(
    '-b, --build <type>',
    `Specifies the build type: "production", or "development". Will override NODE_ENV. (Current = "${ currentFavor }")`,
    /^(production|development)$/i,
    currentFavor
  )
  .option(
    '-r, --bundler <type>',
    `Specifies the bundler: "rollup", or "webpack". Will override BUNDLER. (Current = ${ currentBundler })`,
    /^(rollup|webpack)$/i,
    currentBundler
  )
  .option('--publishsettings <publish settings file>', 'Specifies the *.PublishSettings file for deployment')
  .parse(process.argv);

const build = (program.build || '').toLowerCase();

switch (build) {
case 'production':
case 'development':
  process.env.NODE_ENV = build;
  break;
}

const bundler = (program.bundler || '').toLowerCase();

switch (bundler) {
case 'rollup':
case 'webpack':
  process.env.BUNDLER = bundler;
  break;
}

if (program.publishsettings) {
  config.DEPLOY_PUBLISH_SETTINGS = program.publishsettings;
}

require('./scripts/build')(gulp);
require('./scripts/clean')(gulp);
require('./scripts/deploy')(gulp);
require('./scripts/pack')(gulp);
