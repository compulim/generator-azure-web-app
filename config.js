'use strict';

const { platform } = require('os');
const { join }     = require('path');

const SOURCE_DIR                    = __dirname;
const SOURCE_PUBLIC_DIR             = join(SOURCE_DIR, 'public/');
const SOURCE_ROLLUP_CONFIG_FILE     = join(SOURCE_PUBLIC_DIR, 'rollup.config.js');
const SOURCE_WEBPACK_CONFIG_FILE    = join(SOURCE_PUBLIC_DIR, 'webpack.config.js');
const SOURCE_STATIC_FILES_DIR       = join(SOURCE_PUBLIC_DIR, 'files/');
const SOURCE_JS_DIR                 = join(SOURCE_PUBLIC_DIR, 'lib/');
const SOURCE_SERVER_DIR             = join(SOURCE_DIR, 'lib/');

const DEST_DIR                      = join(__dirname, 'dist/');
const DEST_PACKAGE_FILE             = join(DEST_DIR, 'packages/web.zip');
const DEST_WEBPACK_DEV_DIR          = join(DEST_DIR, 'webpack/');
const DEST_WEBSITE_DIR              = join(DEST_DIR, 'website/');
const DEST_WEBSITE_SERVER_DIR       = join(DEST_WEBSITE_DIR, 'lib/');
const DEST_WEBSITE_STATIC_FILES_DIR = join(DEST_WEBSITE_DIR, 'public/');
const DEST_WEBSITE_BUNDLE_DIR       = join(DEST_WEBSITE_STATIC_FILES_DIR, 'js/');
const DEST_WEBSITE_BUNDLE_FILE      = join(DEST_WEBSITE_BUNDLE_DIR, 'bundle.js');

const MSDEPLOY_BIN_FILE             = platform() === 'win32' && join(process.env['ProgramFiles(x86)'] || process.env.ProgramFiles, 'IIS\\Microsoft Web Deploy V3\\msdeploy.exe');

const MSDEPLOY_IIS_PARAMETERS = {
  defaultValue: 'Default Web Site',
  kind:         'ProviderPath',
  name:         'IIS Web Application Name',
  scope:        'IisApp',
  tags:         'IisApp'
};

module.exports = {
  SOURCE_DIR,
  SOURCE_PUBLIC_DIR,
  SOURCE_ROLLUP_CONFIG_FILE,
  SOURCE_WEBPACK_CONFIG_FILE,
  SOURCE_STATIC_FILES_DIR,
  SOURCE_JS_DIR,
  SOURCE_SERVER_DIR,

  DEST_DIR,
  DEST_PACKAGE_FILE,
  DEST_WEBPACK_DEV_DIR,
  DEST_WEBSITE_DIR,
  DEST_WEBSITE_SERVER_DIR,
  DEST_WEBSITE_STATIC_FILES_DIR,
  DEST_WEBSITE_BUNDLE_DIR,
  DEST_WEBSITE_BUNDLE_FILE,

  MSDEPLOY_BIN_FILE,
  MSDEPLOY_IIS_PARAMETERS
};
