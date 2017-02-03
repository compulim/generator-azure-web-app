'use strict';

module.exports = function (config, favor) {
  if (typeof process.env.PORT === 'string') {
    config.PORT = process.env.PORT;
  }

  return config;
};
