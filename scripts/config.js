'use strict';

const
  env = process.env,
  nodeEnv = env.node_env,
  path = require('path');

// We cannot use __dirname because it could resolve Z: to UNC path
// And Webpack memory-fs will fail on UNC path

const
  __DIRNAME = path.join(process.cwd(), 'scripts');

const BUILD_OUTPUT = path.resolve(__DIRNAME, '../dist/');
const WEB_ROOT = path.resolve(__DIRNAME, '../web/');

const IISAPP_INTERMEDIATE_PATH = path.resolve(BUILD_OUTPUT, 'iisapp/');
const IISAPP_PACKAGE_PATH = path.resolve(BUILD_OUTPUT, 'packages/web.zip');

const MSDEPLOY_BIN_PATH = path.resolve(process.env['ProgramFiles(x86)'] || process.env.ProgramFiles, 'IIS\\Microsoft Web Deploy V3\\msdeploy.exe');
const MSDEPLOY_IIS_PARAMETERS = {
  name: 'IIS Web Application Name',
  defaultValue: 'Default Web Site',
  tags: 'IisApp',
  kind: 'ProviderPath',
  scope: 'IisApp'
};

const PROD_SERVER_SRC = globIgnoreNodeModules('../prodserver').concat(
  path.resolve(__DIRNAME, '../iisnode.yml'),
  path.resolve(__DIRNAME, '../package.json')
);

const WEBPACK_CONFIG_PATH = path.join(WEB_ROOT, 'webpack.config.js');
const WEBPACK_CONTENT_SRC = path.join(WEB_ROOT, 'public/**');

let DEPLOY_PUBLISH_SETTINGS;

module.exports = {
  BUILD_OUTPUT,

  DEPLOY_PUBLISH_SETTINGS,

  IISAPP_INTERMEDIATE_PATH,
  IISAPP_PACKAGE_PATH,

  MSDEPLOY_BIN_PATH,
  MSDEPLOY_IIS_PARAMETERS,

  PROD_SERVER_SRC,

  WEBPACK_CONFIG_PATH,
  WEBPACK_CONTENT_SRC
};

function globIgnoreNodeModules(relativePath) {
  const absolutePath = path.resolve(__DIRNAME, relativePath);

  return [
    `${ absolutePath }/**`,
    `!${ absolutePath }/**/{node_modules,node_modules/**}`,
    `!${ absolutePath }/**/.ntvs_analysis.dat`,
    `!${ absolutePath }/**/.vs`
  ];
}
