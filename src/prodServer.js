'use strict';

const
  express = require('express'),
  fs = require('fs'),
  parseURL = require('url').parse;

class ProdServer {
  constructor(options) {
    this.options = options;
    this.app = express()
      .use('/api', require('./controllers/api')())
      .use((req, res, next) => {
        const url = parseURL(req.url);

        if (/\/[\d\w]+$/.test(url.pathname)) {
          req.url = '/index.html';
        }

        next();
      })
      .use(express.static(this.options.contentPath));
  }

  listen() {
    return new Promise(
      (resolve, reject) => {
        fs.stat(this.options.contentPath, err => err ? reject(err) : resolve())
      })
      .then(
        () => new Promise((resolve, reject) => {
          this.app
            .on('error', err => reject(err))
            .listen(this.options.port, resolve);
        }),
        err => {
          if (err.code === 'ENOENT') {
            console.error(`No content to serve from ${ this.options.contentPath }, please run "npm run build" first, or specify alternative content path by --content-path`);

            return Promise.reject(new Error(`no content to serve`));
          } else {
            return Promise.reject(err);
          }
        }
      )
      .then(() => console.info(`Production server now listening to port ${ this.options.port }, serving content from ${ this.options.contentPath }`));
  }
}

module.exports = ProdServer;
