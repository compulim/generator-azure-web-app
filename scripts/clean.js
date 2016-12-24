'use strict';

const config = require('../config');
const del    = require('del');
const gutil  = require('gulp-util');

const { prettyPath } = require('./util');

module.exports = function (gulp) {
  gulp.task('clean', [
    'clean:package',
    'clean:webroot'
  ], clean);

  gulp.task('clean:package', cleanPackage);
  gulp.task('clean:webroot', cleanWebRoot);

  function clean() {
    gutil.log('[clean]', `Cleaned ${ prettyPath(config.DEST_DIR) }`);
  }

  function cleanPackage() {
    gutil.log('[clean:package]', `Cleaning package at ${ prettyPath(config.DEST_PACKAGE_FILE) }`);

    return del(config.DEST_PACKAGE_FILE)
      .catch(err => {
        gutil.log('[clean:package]', `Failed to clean package ${ prettyPath(config.DEST_PACKAGE_FILE) }`);
        return Promise.reject(err);
      });
  }

  function cleanWebRoot() {
    gutil.log('[clean:webroot]', `Cleaning web root at ${ prettyPath(config.DEST_WEBSITE_DIR) }`);

    return del(config.DEST_WEBSITE_DIR)
      .catch(err => {
        gutil.log('[clean:webroot]', `Failed to clean webroot at ${ prettyPath(config.DEST_WEBSITE_DIR) }`);
        return Promise.reject(err);
      });
  }
};
