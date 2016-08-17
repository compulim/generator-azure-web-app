'use strict';

const path = require('path');

module.exports = {
  CONTENT_PATH: path.join(__dirname, '../../web/public'),
  HOT_MODULE_REPLACEMENT: true,
  PORT: 80,
  USE_ABSOLUTE_PATH: true,
  WRITE_TO_DISK: true
};
