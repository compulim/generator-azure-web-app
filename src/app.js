'use strict';

const config = require('./config');

const runningAsMain = require.main === module;
const runningUnderIISNode = process.env.iisnode_version;
const shouldRun = runningAsMain || runningUnderIISNode;

if (process.env.node_env === 'production') {
  const ProdServer = module.exports = require('./prodServer');

  shouldRun && (new ProdServer({
    contentPath: config.CONTENT_PATH,
    port:        config.PORT
  })).listen();
} else {
  const DevServer = module.exports = require('./devServer');

  shouldRun && (new DevServer({
    contentPath         : config.CONTENT_PATH,
    hotModuleReplacement: config.HOT_MODULE_REPLACEMENT,
    port                : config.PORT,
    useAbsolutePath     : config.USE_ABSOLUTE_PATH,
    writeToDisk         : config.WRITE_TO_DISK
  })).listen();
}