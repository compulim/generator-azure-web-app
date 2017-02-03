'use strict';

const config   = require('../config');
const del      = require('del');

const { log, prettyPath } = require('./util');

module.exports = function (gulp) {
  gulp.task('clean', [
    'clean:package',
    'clean:website'
  ], clean);

  gulp.task('clean:package', cleanPackage);
  gulp.task('clean:website', cleanWebsite);

  function clean() {
    log('clean', `Cleaned ${ prettyPath(config.DEST_DIR) }`);
  }

  function cleanPackage() {
    log('clean:package', `Cleaning package at ${ prettyPath(config.DEST_PACKAGE_FILE) }`);

    return del(config.DEST_PACKAGE_FILE)
      .catch(err => {
        log('clean:package', `Failed to clean package ${ prettyPath(config.DEST_PACKAGE_FILE) }`);
        return Promise.reject(err);
      });
  }

  function cleanWebsite() {
    log('clean:website', `Cleaning web root at ${ prettyPath(config.DEST_WEBSITE_DIR) }`);

    return del(config.DEST_WEBSITE_DIR)
      .catch(err => {
        log('clean:website', `Failed to clean webroot at ${ prettyPath(config.DEST_WEBSITE_DIR) }`);
        return Promise.reject(err);
      });
  }
};
