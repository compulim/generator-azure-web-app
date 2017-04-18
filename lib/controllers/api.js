'use strict';

const os = require('os');

module.exports = function () {
  const router = require('express').Router();

  router.get('/health', (req, res) => {
    res.json({
      now: Date.now(),
      NODE_ENV: process.env.NODE_ENV,
      version: process.version,
      os: {
        arch    : os.arch(),
        platform: os.platform(),
        release : os.release(),
        type    : os.type()
      }
    });
  });

  return router;
};
