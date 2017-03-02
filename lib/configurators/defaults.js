'use strict';

const path = require('path');

module.exports = function (config, favor) {
  config.PORT = 80;

  if (favor === 'production') {
    config.CONTENT_PATH = path.join(__dirname, '../../public');
  } else {
    const metaConfig = require('../../config');

    config.CONTENT_PATH           = metaConfig.SOURCE_STATIC_FILES_DIR;
    config.HOT_MODULE_REPLACEMENT = true;
    config.USE_ABSOLUTE_PATH      = true;
    config.WRITE_TO_DISK          = true;
  }

  return config;
}
