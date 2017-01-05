'use strict';

module.exports = function () {
  const router = require('express').Router();

  router.get('/health', (req, res) => {
    res.json({ now: Date.now() });
  });

  return router;
};
