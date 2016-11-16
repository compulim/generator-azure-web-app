'use strict';

const
  env = process.env,
  nodeEnv = env.node_env,
  os = require('os'),
  path = require('path');

const BUILD_OUTPUT = path.resolve(__dirname, '../dist/');
const WEB_ROOT = path.resolve(__dirname, '../web/');

const IISAPP_INTERMEDIATE_PATH = path.resolve(BUILD_OUTPUT, 'iisapp/');
const IISAPP_PACKAGE_PATH = path.resolve(BUILD_OUTPUT, 'packages/web.zip');

const MSDEPLOY_BIN_PATH = os.platform() === 'win32' && path.resolve(process.env['ProgramFiles(x86)'] || process.env.ProgramFiles, 'IIS\\Microsoft Web Deploy V3\\msdeploy.exe');
const MSDEPLOY_IIS_PARAMETERS = {
  name: 'IIS Web Application Name',
  defaultValue: 'Default Web Site',
  tags: 'IisApp',
  kind: 'ProviderPath',
  scope: 'IisApp'
};

const PROD_SERVER_SRC = globIgnoreNodeModules('../prodserver').concat(
  path.resolve(__dirname, '../iisnode.yml'),
  path.resolve(__dirname, '../package.json')
);

const ROLLUP_CONFIG_PATH = path.join(WEB_ROOT, 'rollup.config.js');
const WEB_CONTENT_SRC = path.join(WEB_ROOT, 'public/**');
const WEBPACK_CONFIG_PATH = path.join(WEB_ROOT, 'webpack.config.js');

let DEPLOY_PUBLISH_SETTINGS;

module.exports = {
  BUILD_OUTPUT,

  DEPLOY_PUBLISH_SETTINGS,

  IISAPP_INTERMEDIATE_PATH,
  IISAPP_PACKAGE_PATH,

  MSDEPLOY_BIN_PATH,
  MSDEPLOY_IIS_PARAMETERS,

  PROD_SERVER_SRC,

  ROLLUP_CONFIG_PATH,

  WEB_CONTENT_SRC,

  WEBPACK_CONFIG_PATH,
};

function globIgnoreNodeModules(relativePath) {
  const absolutePath = path.resolve(__dirname, relativePath);

  return [
    `${ absolutePath }/**`,
    `!${ absolutePath }/**/{node_modules,node_modules/**}`,
    `!${ absolutePath }/**/.ntvs_analysis.dat`,
    `!${ absolutePath }/**/.vs`
  ];
}
