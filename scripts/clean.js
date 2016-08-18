'use strict';

const
  config = require('./config'),
  del = require('del'),
  gutil = require('gulp-util'),
  path = require('path');

module.exports = function (gulp) {
  gulp.task('clean', [
    'clean:package',
    'clean:webroot'
  ], clean);

  gulp.task('clean:package', cleanPackage);
  gulp.task('clean:webroot', cleanWebRoot);

  function clean() {
    gutil.log('[clean]', `Output cleaned at ${ path.relative('.', config.BUILD_OUTPUT) }`);
  }

  function cleanPackage() {
    gutil.log('[clean:package]', `Cleaning package at ${ path.relative('.', config.IISAPP_PACKAGE_PATH) }`);

    return del(config.IISAPP_PACKAGE_PATH)
      .catch(err => {
        gutil.log('[clean:package]', `Failed to clean package ${ path.relative('.', config.IISAPP_PACKAGE_PATH) }`);
        return Promise.reject(err);
      });
  }

  function cleanWebRoot() {
    gutil.log('[clean:webroot]', `Cleaning web root at ${ path.relative('.', config.IISAPP_INTERMEDIATE_PATH) }`);

    return del(config.IISAPP_INTERMEDIATE_PATH)
      .catch(err => {
        gutil.log('[clean:webroot]', `Failed to clean webroot at ${ path.relative('.', config.IISAPP_INTERMEDIATE_PATH) }`);
        return Promise.reject(err);
      });
  }
};
