'use strict';

const
  env = process.env,
  nodeEnv = env.node_env,
  path = require('path');

const BUILD_OUTPUT = path.resolve(__dirname, '../dist/');
const WEB_ROOT = path.resolve(__dirname, '../web/');

module.exports = {
  BUILD_OUTPUT,

  IISAPP_INTERMEDIATE_PATH: path.resolve(BUILD_OUTPUT, 'iisapp/'),
  IISAPP_PACKAGE_PATH: path.resolve(BUILD_OUTPUT, 'packages/web.zip'),

  MSDEPLOY_BIN_PATH: path.resolve(process.env['ProgramFiles(x86)'] || process.env.ProgramFiles, 'IIS\\Microsoft Web Deploy V3\\msdeploy.exe'),
  MSDEPLOY_IIS_PARAMETERS: {
    name: 'IIS Web Application Name',
    defaultValue: 'Default Web Site',
    tags: 'IisApp',
    kind: 'ProviderPath',
    scope: 'IisApp'
  },

  PROD_SERVER_SRC: globIgnoreNodeModules('../prodserver').concat(
    path.resolve(__dirname, '../package.json')
  ),

  WEBPACK_CONTENT_SRC: path.join(WEB_ROOT, 'public/**'),
  WEBPACK_CONFIG_PATH: path.join(WEB_ROOT, 'webpack.config.js')
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
