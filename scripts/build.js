'use strict';

const buffer     = require('vinyl-buffer');
const config     = require('../config');
const del        = require('del');
const filter     = require('gulp-filter');
const gutil      = require('gulp-util');
const htmlmin    = require('gulp-htmlmin');
const imagemin   = require('gulp-imagemin');
const install    = require('gulp-install');
const rename     = require('gulp-rename');
const rollup     = require('rollup-stream');
const source     = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const webpack    = require('webpack-stream');

const { basename, join, relative }          = require('path');
const { globIgnoreNodeModules, prettyPath } = require('./util');

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
    gutil.log('[build]', `Build with "${ process.env.NODE_ENV }" favor outputted to ${ prettyPath(config.DEST_WEBSITE_DIR) }`);
  }

  function buildContent() {
    gutil.log('[build:content]', `Copying content from ${ prettyPath(config.SOURCE_STATIC_FILES_DIR) } to ${ prettyPath(config.DEST_WEBSITE_STATIC_FILES_DIR) }`);

    const htmlFilter = filter(['*.htm', '*.html'], { restore: true });
    const imageFilter = filter(['*.gif', '*.jpg', '*.png'], { restore: true });

    return gulp
      .src(join(config.SOURCE_STATIC_FILES_DIR, '**'))
      .pipe(htmlFilter)
      .pipe(htmlmin())
      .pipe(htmlFilter.restore)
      .pipe(imageFilter)
      .pipe(imagemin())
      .pipe(imageFilter.restore)
      .pipe(gulp.dest(config.DEST_WEBSITE_STATIC_FILES_DIR));
  }

  function buildServer() {
    gutil.log('[build:server]', `Copying code from ${ prettyPath(config.SOURCE_SERVER_DIR) } to ${ prettyPath(config.DEST_WEBSITE_DIR) }`);

    return gulp
      .src(
        globIgnoreNodeModules(config.SOURCE_SERVER_DIR).concat(
          join(__dirname, 'iisnode.yml'),
          join(__dirname, '../package.json')
        )
      )
      .pipe(gulp.dest(config.DEST_WEBSITE_DIR))
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
    gutil.log('[build:webpack]', `Using configuration from ${ prettyPath(config.SOURCE_WEBPACK_CONFIG_FILE) }`);

    const WEBPACK_CONFIG = require(config.SOURCE_WEBPACK_CONFIG_FILE);

    gutil.log('[build:webpack]', 'Bundling with entrypoints:', WEBPACK_CONFIG.entry.map(entry => prettyPath(entry)).join(', '));
    gutil.log('[build:webpack]', `Will output to ${ prettyPath(config.DEST_WEBSITE_BUNDLE_FILE) }`);

    const sourceMap = process.env.SOURCE_MAP === 'true';

    sourceMap && gutil.log('[build:webpack]', 'Source map is enabled, this build should not be used for production');

    return gulp
      .src([])
      .pipe(webpack(
        sourceMap ?
          Object.assign({}, WEBPACK_CONFIG, { devtool: 'source-map' })
        :
          WEBPACK_CONFIG
      ))
      .pipe(gulp.dest(config.DEST_WEBSITE_BUNDLE_DIR));
  }

  function buildRollup() {
    gutil.log('[build:rollup]', `Using configuration from ${ prettyPath(config.SOURCE_ROLLUP_CONFIG_FILE) }`);

    const ROLLUP_CONFIG = require(config.SOURCE_ROLLUP_CONFIG_FILE)['default'];

    gutil.log('[build:rollup]', 'Bundling with entrypoint:', ROLLUP_CONFIG.entry);
    gutil.log('[build:rollup]', `Will output to ${ prettyPath(config.DEST_WEBSITE_BUNDLE_FILE) }`);

    const sourceMap = process.env.SOURCE_MAP === 'true';

    let workflow = rollup(Object.assign({}, ROLLUP_CONFIG, { sourceMap })).pipe(source(basename(config.DEST_WEBSITE_BUNDLE_FILE)));

    sourceMap && gutil.log('[build:rollup]', 'Source map is enabled, this build should not be used for production');

    if (sourceMap) {
      workflow = workflow
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('.'));
    }

    return workflow.pipe(gulp.dest(config.DEST_WEBSITE_BUNDLE_DIR));
  }
};
