'use strict';

module.exports = function () {
  const router = require('express').Router();

  router.get('/health', (req, res) => {
    res.json({
      now: Date.now(),
      NODE_ENV: process.env.NODE_ENV,
      version: process.version
    });
  });

  return router;
};
