'use strict';

const config = require('./appConfig');

if (process.env.NODE_ENV === 'production') {
  const ProdServer = require('./prodServer');

  (new ProdServer({
    contentPath: config.CONTENT_PATH,
    port       : config.PORT
  })).listen();
} else {
  const DevServer = require('./devServer');

  (new DevServer({
    contentPath         : config.CONTENT_PATH,
    hotModuleReplacement: config.HOT_MODULE_REPLACEMENT,
    port                : config.PORT,
    useAbsolutePath     : config.USE_ABSOLUTE_PATH,
    writeToDisk         : config.WRITE_TO_DISK
  })).listen();
}
