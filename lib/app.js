'use strict';

const path = require('path');

process.env.NODE_ENV = /^production$/i.test(process.env.NODE_ENV) ? 'production' : 'development';
process.env.NODE_CONFIG_DIR || (process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config'));

require('./parseCli')();

const config = require('config');
const PORT = +config.get('PORT') || config.get('PORT');

if (process.env.NODE_ENV === 'production') {
  const ProdServer = require('./prodServer');

  (new ProdServer({
    contentPath: config.get('CONTENT_PATH'),
    port       : PORT
  })).listen();
} else {
  const DevServer = require('./devServer');

  (new DevServer({
    contentPath         : config.get('CONTENT_PATH'),
    hotModuleReplacement: config.get('HOT_MODULE_REPLACEMENT') !== 'false',
    port                : PORT,
    useAbsolutePath     : config.get('USE_ABSOLUTE_PATH') !== 'false',
    writeToDisk         : config.get('WRITE_TO_DISK') !== 'false'
  })).listen();
}
