'use strict';

const config  = require('./config');
const gulp    = require('gulp');
const program = require('commander');

const currentBundler   = process.env.NPM_CONFIG_BUNDLER === 'webpack' ? 'webpack' : 'rollup';
const currentFavor     = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const currentSourceMap = process.env.SOURCE_MAP === 'true' ? true : false;

program
  .allowUnknownOption()
  .option(
    '-b, --build <type>',
    `Specifies the build type: "production", or "development". Will override NODE_ENV. (Current = ${ currentFavor })`,
    /^(production|development)$/i,
    currentFavor
  )
  .option(
    '-r, --bundler <type>',
    `Specifies the bundler: "rollup", or "webpack". Will override NPM_CONFIG_BUNDLER. (Current = ${ currentBundler })`,
    /^(rollup|webpack)$/i,
    currentBundler
  )
  .option(
    '--source-map <true>',
    `Specifies whether source map will be built or not. Will override SOURCE_MAP. (Current = ${ currentSourceMap })`,
    /^(true|false)$/i,
    currentSourceMap
  )
  .option('--publish-settings <publish settings file>', 'Specifies the *.PublishSettings file for deployment')
  .parse(process.argv);

const build = (program.build || '').toLowerCase();

process.env.NODE_ENV = (program.build || '').toLowerCase() === 'development' ? 'development' : 'production';
process.env.NPM_CONFIG_BUNDLER = (program.bundler || '').toLowerCase() === 'webpack' ? 'webpack' : 'rollup';
process.env.SOURCE_MAP = (program.sourceMap || '').toLowerCase() === 'true';

if (program.publishSettings) {
  config.DEPLOY_PUBLISH_SETTINGS = program.publishSettings;
}

require('./scripts/build')(gulp);
require('./scripts/clean')(gulp);
require('./scripts/deploy')(gulp);
require('./scripts/pack')(gulp);
