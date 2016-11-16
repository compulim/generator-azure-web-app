'use strict';

const buffer     = require('vinyl-buffer');
const config     = require('./config');
const del        = require('del');
const gutil      = require('gulp-util');
const htmlmin    = require('gulp-htmlmin');
const imagemin   = require('gulp-imagemin');
const install    = require('gulp-install');
const path       = require('path');
const rename     = require('gulp-rename');
const rollup     = require('rollup-stream');
const source     = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const webpack    = require('webpack-stream');

const
  ROLLUP_CONFIG = require(config.ROLLUP_CONFIG_PATH)['default'],
  WEBPACK_CONFIG = require(config.WEBPACK_CONFIG_PATH),
  WEBPACK_DIRNAME = path.dirname(config.WEBPACK_CONFIG_PATH);

const
  CONTENT_DEST = path.resolve(
    config.IISAPP_INTERMEDIATE_PATH,
    'public'
  );

const
  ROLLUP_DEST = path.resolve(
    CONTENT_DEST,
    path.dirname(ROLLUP_CONFIG.dest)
  ),
  WEBPACK_DEST = path.resolve(
    CONTENT_DEST,
    WEBPACK_CONFIG.output.publicPath.replace(/^\//, '')
  ),
  ENTRY_PATHS = WEBPACK_CONFIG.entry;

module.exports = function (gulp) {
  gulp.task('build', [
    'build:content',
    'build:server',
    'build:bundle'
  ], build);

  gulp.task('build:bundle', buildBundle);
  gulp.task('build:content', buildContent);
  gulp.task('build:server', buildServer);

  gulp.task('rebuild', [
    'rebuild:content',
    'rebuild:server',
    'rebuild:bundle'
  ], build);

  gulp.task('rebuild:bundle', ['clean:webroot'], buildBundle);
  gulp.task('rebuild:content', ['clean:webroot'], buildContent);
  gulp.task('rebuild:server', ['clean:webroot'], buildServer);

  function build() {
    gutil.log('[build]', `Build with "${ process.env.NODE_ENV }" favor outputted to ${ path.relative('.', config.IISAPP_INTERMEDIATE_PATH) }`);
  }

  function buildContent() {
    gutil.log('[build:content]', `Copying content from ${ path.relative('.', config.WEB_CONTENT_SRC) } to ${ path.relative('.', CONTENT_DEST) }`);

    return gulp
      .src(config.WEB_CONTENT_SRC)
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

  function buildBundle() {
    if (process.env.BUNDLER === 'webpack') {
      gutil.log('[build:bundle]', 'Bundling with Webpack');

      return buildWebpack();
    } else {
      gutil.log('[build:bundle]', 'Bundling with rollup.js');

      return buildRollup();
    }
  }

  function buildWebpack() {
    gutil.log('[build:webpack]', `Using configuration from ${ path.relative('.', config.WEBPACK_CONFIG_PATH) }`);
    gutil.log('[build:webpack]', 'Bundling with entrypoints:', ENTRY_PATHS.map(entry => path.relative('.', entry)).join(', '));

    const { SOURCE_MAP: sourceMap } = process.env;

    sourceMap && gutil.log('[build:webpack]', 'Source map is enabled, this build should not be used for production');

    return gulp
      .src([])
      .pipe(webpack(
        sourceMap ?
          Object.assign({}, WEBPACK_CONFIG, { devtool: 'source-map' })
        :
          WEBPACK_CONFIG
      ))
      .pipe(gulp.dest(WEBPACK_DEST));
  }

  function buildRollup() {
    gutil.log('[build:rollup]', `Using configuration from ${ path.relative('.', config.ROLLUP_CONFIG_PATH) }`);
    gutil.log('[build:rollup]', 'Bundling with entrypoints:', ROLLUP_CONFIG.entry);

    const { SOURCE_MAP: sourceMap } = process.env;

    let workflow = rollup(Object.assign({}, ROLLUP_CONFIG, { sourceMap })).pipe(source('bundle.js'));

    sourceMap && gutil.log('[build:webpack]', 'Source map is enabled, this build should not be used for production');

    if (sourceMap) {
      workflow = workflow
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('.'));
    }

    workflow.pipe(gulp.dest(ROLLUP_DEST));
  }
};

function filter(array, predicate) {
  return array.reduce((result, item, index) => {
    predicate(item, index) && result.push(item);

    return result;
  }, []);
}
