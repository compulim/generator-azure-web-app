'use strict';

const metaConfig = require('../../config');

module.exports = {
  CONTENT_PATH          : metaConfig.SOURCE_STATIC_FILES_DIR,
  HOT_MODULE_REPLACEMENT: true,
  USE_ABSOLUTE_PATH     : true,
  WRITE_TO_DISK         : true
};
