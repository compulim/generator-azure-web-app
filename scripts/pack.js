'use strict';

const
  config = require('./config'),
  ChildProcess = require('child_process'),
  del = require('del'),
  fs = require('fs'),
  gutil = require('gulp-util'),
  os = require('os'),
  path = require('path'),
  Promise = require('bluebird'),
  sevenZip = require('es-7z');

const
  exec = Promise.promisify(ChildProcess.exec),
  mkdirp = Promise.promisify(require('mkdirp')),
  stat = Promise.promisify(fs.stat);

module.exports = function (gulp) {
  gulp.task('pack', ['pack:iisapp']);
  gulp.task('pack:prepare', packPrepare);
  gulp.task('pack:iisapp', ['pack:prepare'], packIISApp);

  gulp.task('repack', ['repack:iisapp']);
  gulp.task('repack:iisapp', ['repack:prepare', 'rebuild'], packIISApp);

  function packPrepare() {
    return Promise.all([
      mkdirp(path.dirname(config.IISAPP_PACKAGE_PATH))
        .catch(err => {
          gutil.log('[pack:prepare]', `Failed to create output directory at ${ config.IISAPP_PACKAGE_PATH }`);
          return Promise.reject(err);
        }),
      stat(config.IISAPP_INTERMEDIATE_PATH)
        .catch(err => {
          gutil.log('[pack:prepare]', `No files were found to pack at ${ config.IISAPP_INTERMEDIATE_PATH }, please run "npm run build" first.`)
          return Promise.reject(err);
        }),
      stat(config.MSDEPLOY_BIN_PATH)
        .catch(err => {
          gutil.log('[pack:prepare]', `MSDeploy not found at ${ config.MSDEPLOY_BIN_PATH }`);
          return Promise.reject(err);
        })
    ]);
  }

  function runMSDeploy(src, dest) {
    if (os.platform() !== 'win32') {
      return Promise.reject(new Error('MSDeploy is only supported on Windows platform'));
    }

    const iisParameters = config.MSDEPLOY_IIS_PARAMETERS;
    const declareParam =
      Object.keys(iisParameters)
        .map(key => `${key}="${iisParameters[key]}"`)
        .join(',');

    return (
      exec([
        `"${ config.MSDEPLOY_BIN_PATH }"`,
        '-verb:sync',
        `-source:iisApp=${ src }`,
        `-dest:package=${ dest }`,
        `-declareParam:${ declareParam }`
      ].join(' '), {
        maxBuffer: 10485760
      })
    );
  }

  function packIISApp() {
    gutil.log('[pack:iisapp]', `Running MSDeploy and output to ${path.relative('.', config.IISAPP_PACKAGE_PATH)}`);

    return runMSDeploy(config.IISAPP_INTERMEDIATE_PATH, config.IISAPP_PACKAGE_PATH);
  }
};
