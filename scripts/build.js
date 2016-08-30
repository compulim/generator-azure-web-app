'use strict';

const
  config = require('./config'),
  del = require('del'),
  gutil = require('gulp-util'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  install = require('gulp-install'),
  path = require('path'),
  rename = require('gulp-rename'),
  webpack = require('webpack-stream');

const
  WEBPACK_CONFIG = require(config.WEBPACK_CONFIG_PATH),
  WEBPACK_DIRNAME = path.dirname(config.WEBPACK_CONFIG_PATH);

const
  CONTENT_DEST = path.resolve(
    config.IISAPP_INTERMEDIATE_PATH,
    'public'
  );

const
  WEBPACK_DEST = path.resolve(
    CONTENT_DEST,
    WEBPACK_CONFIG.output.publicPath.replace(/^\//, '')
  ),
  ENTRY_PATHS = WEBPACK_CONFIG.entry;

module.exports = function (gulp) {
  gulp.task('build', [
    'build:content',
    'build:server',
    'build:webpack'
  ], build);

  gulp.task('build:content', buildContent);
  gulp.task('build:server', buildServer);
  gulp.task('build:webpack', buildWebpack);

  gulp.task('rebuild', [
    'rebuild:content',
    'rebuild:server',
    'rebuild:webpack'
  ], build);

  gulp.task('rebuild:content', ['clean:webroot'], buildContent);
  gulp.task('rebuild:server', ['clean:webroot'], buildServer);
  gulp.task('rebuild:webpack', ['clean:webroot'], buildWebpack);

  function build() {
    gutil.log('[build]', `Build with "${ process.env.NODE_ENV }" favor outputted to ${ path.relative('.', config.IISAPP_INTERMEDIATE_PATH) }`);
  }

  function buildContent() {
    gutil.log('[build:content]', `Copying content from ${ path.relative('.', config.WEBPACK_CONTENT_SRC) } to ${ path.relative('.', CONTENT_DEST) }`);

    return gulp
      .src(config.WEBPACK_CONTENT_SRC)
      .pipe(htmlmin())
      .pipe(imagemin())
      .pipe(gulp.dest(CONTENT_DEST));
  }

  function buildServer() {
    gutil.log('[build:server]', `Copying code from ${ path.relative('.', config.PROD_SERVER_SRC[0]) } to ${ path.relative('.', config.IISAPP_INTERMEDIATE_PATH) }`);

    return gulp
      .src(config.PROD_SERVER_SRC)
      .pipe(gulp.dest(config.IISAPP_INTERMEDIATE_PATH))
      .pipe(install({
        ignoreScripts: true,
        production: true
      }));
  }

  function buildWebpack() {
    gutil.log('[build:webpack]', `Using configuration from ${ path.relative('.', config.WEBPACK_CONFIG_PATH) }`);
    gutil.log('[build:webpack]', 'Packing with entrypoints:', ENTRY_PATHS.map(entry => path.relative('.', entry)).join(', '));

    return gulp
      .src([])
      .pipe(webpack(WEBPACK_CONFIG))
      .pipe(gulp.dest(WEBPACK_DEST));
  }
};

function filter(array, predicate) {
  return array.reduce((result, item, index) => {
    predicate(item, index) && result.push(item);

    return result;
  }, []);
}
