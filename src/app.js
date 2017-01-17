'use strict';

const config = require('./config');
const ProdServer = require('./prodServer');

(new ProdServer({
  contentPath: config.CONTENT_PATH,
  port:        config.PORT
})).listen();
