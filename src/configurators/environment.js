'use strict';

module.exports = function (config, favor) {
  if (typeof process.env.PORT === 'number') {
    config.PORT = process.env.PORT;
  }

  return config;
};
