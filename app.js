'use strict';

const config = require('./src/config');

const runningAsMain = require.main === module;
const runningUnderIISNode = process.env.iisnode_version;
const shouldRun = runningAsMain || runningUnderIISNode;

if (process.env.node_env === 'production') {
  require('./src/app');
} else {
  // TODO: Why should we export the prod/dev server? What is the usage scenario?
  const DevServer = module.exports = require('./src/devServer');

  shouldRun && (new DevServer({
    contentPath         : config.CONTENT_PATH,
    hotModuleReplacement: config.HOT_MODULE_REPLACEMENT,
    port                : config.PORT,
    useAbsolutePath     : config.USE_ABSOLUTE_PATH,
    writeToDisk         : config.WRITE_TO_DISK
  })).listen();
}
