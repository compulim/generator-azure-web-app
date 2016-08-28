'use strict';

const config = require('./config');

const
  debug = require('debug'),
  express = require('express'),
  fs = require('fs'),
  parseURL = require('url').parse,
  path = require('path'),
  program = require('commander');

class ProdServer {
  constructor() {
    this.app = express()
      .use('/api', require('./controllers/api')())
      .use((req, res, next) => {
        const url = parseURL(req.url);

        if (/\/[\d\w]+$/.test(url.pathname)) {
          req.url = '/index.html';
        }

        next();
      })
      .use(express.static(config.CONTENT_PATH));
  }

  listen(port) {
    return new Promise(
      (resolve, reject) => {
        fs.stat(config.CONTENT_PATH, err => err ? reject(err) : resolve())
      })
      .then(
        () => new Promise((resolve, reject) => {
          this.app
            .on('error', err => reject(err))
            .listen(port, resolve);
        }),
        err => Promise.reject(err.code === 'ENOENT' ? new Error(`no content to serve`) : err)
      )
      .then(() => port);
  }
}

function main() {
  return new ProdServer();
}

module.exports = main;

const
  runningAsMain = require.main === module,
  runningUnderIISNode = process.env.iisnode_version;

(runningAsMain || runningUnderIISNode) && main().listen(config.PORT)
  .then(
    port => {
      console.info(`Production server now listening to port ${ port }, serving content from ${ config.CONTENT_PATH }`);
    },
    err => {
      if (err.message === 'no content to serve') {
        console.error(`No content to serve from ${ config.CONTENT_PATH }, please run "npm run build" first, or specify alternative content path by --content-path`);
      } else {
        console.error(err);
      }
    });
