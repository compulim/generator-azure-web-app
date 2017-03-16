'use strict';

const buffer     = require('vinyl-buffer');
const config     = require('../config');
const del        = require('del');
const filter     = require('gulp-filter');
const htmlmin    = require('gulp-htmlmin');
const imagemin   = require('gulp-imagemin');
const install    = require('gulp-install');
const rename     = require('gulp-rename');
const rollup     = require('rollup-stream');
const source     = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify     = require('gulp-uglify');
const webpack    = require('webpack-stream');
const Webpack    = require('webpack');

const { magenta, red }                           = require('colors');
const { basename, join, relative }               = require('path');
const { globIgnoreNodeModules, log, prettyPath } = require('./util');

const UGLIFY_OPTIONS = {
  compress: {
    screw_ie8: false,
    warnings : false
  },
  mangle: {
    screw_ie8: false
  },
  output: {
    screw_ie8: false
  }
};

module.exports = function (gulp) {
  gulp.task('build', [
    'build:asset',
    'build:bundle',
    'build:config',
    'build:lib',
    'build:package'
  ], build);

  gulp.task('build:asset', buildAsset);
  gulp.task('build:bundle', buildBundle);
  gulp.task('build:config', buildConfig);
  gulp.task('build:lib', buildLib);
  gulp.task('build:package', ['build:lib'], buildPackage);

  function build() {
    log('build', `Build with ${ magenta(process.env.NODE_ENV) } favor outputted to ${ prettyPath(config.DEST_WEBSITE_DIR) }`);
  }

  function buildAsset() {
    log('build:asset', `Copying content from ${ prettyPath(config.SOURCE_STATIC_FILES_DIR) } to ${ prettyPath(config.DEST_WEBSITE_STATIC_FILES_DIR) }`);

    const htmlFilter = filter(['**/*.htm', '**/*.html'], { restore: true });
    const imageFilter = filter(['**/*.gif', '**/*.jpg', '**/*.png', '**/*.svg'], { restore: true });

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

  function buildConfig() {
    log('build:config', `Copying config from ${ prettyPath(config.SOURCE_DIR) } to ${ prettyPath(config.DEST_WEBSITE_DIR) }`);

    return gulp
      .src(
        [
          'config.js',
          'iisnode.yml',
          'web.config'
        ].map(filename => join(config.SOURCE_DIR, filename))
      )
      .pipe(gulp.dest(config.DEST_WEBSITE_DIR));
  }

  function buildLib() {
    log('build:lib', `Copying code from ${ prettyPath(config.SOURCE_SERVER_DIR) } to ${ prettyPath(config.DEST_WEBSITE_SERVER_DIR) }`);

    return gulp
      .src([
        `${ config.SOURCE_SERVER_DIR }/**`
      ])
      .pipe(gulp.dest(config.DEST_WEBSITE_SERVER_DIR));
  }

  function buildPackage() {
    log('build:package', 'Installing npm packages');

    return gulp
      .src([
        `${ config.SOURCE_SERVER_DIR }/package.json`
      ])
      .pipe(gulp.dest(config.DEST_WEBSITE_SERVER_DIR))
      .pipe(install({ production: true }));
  }

  function buildBundle() {
    if (process.env.NPM_CONFIG_BUNDLER === 'webpack') {
      log('build:bundle', `Bundling with ${ magenta('Webpack') }`);

      return buildWebpack();
    } else {
      log('build:bundle', `Bundling with ${ magenta('rollup.js') }`);

      return buildRollup();
    }
  }

  function buildWebpack() {
    log('build:webpack', `Using configuration from ${ prettyPath(config.SOURCE_WEBPACK_CONFIG_FILE) }`);

    const WEBPACK_CONFIG = require(config.SOURCE_WEBPACK_CONFIG_FILE);

    WEBPACK_CONFIG.module.loaders.forEach(loader => {
      loader.loaders = loader.loaders.filter(loader => !/^react-hot-loader/.test(loader));
    });

    log('build:webpack', 'Bundling with entrypoints:', WEBPACK_CONFIG.entry.map(entry => prettyPath(entry)).join(', '));
    log('build:webpack', `Will output to ${ prettyPath(config.DEST_WEBSITE_BUNDLE_FILE) }`);

    const sourceMap = process.env.SOURCE_MAP === 'true';

    sourceMap && log('build:webpack', red('Source map is enabled, this build should not be used for production'));

    const plugins = WEBPACK_CONFIG.plugins || (WEBPACK_CONFIG.plugins = []);

    plugins.splice(Infinity, 0,
      new Webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new Webpack.optimize.UglifyJsPlugin(UGLIFY_OPTIONS)
    );

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
    log('build:rollup', `Using configuration from ${ prettyPath(config.SOURCE_ROLLUP_CONFIG_FILE) }`);

    const ROLLUP_CONFIG = require(config.SOURCE_ROLLUP_CONFIG_FILE)['default'];

    log('build:rollup', `Bundling with entrypoint ${ prettyPath(ROLLUP_CONFIG.entry) }`);
    log('build:rollup', `Will output to ${ prettyPath(config.DEST_WEBSITE_BUNDLE_FILE) }`);

    const sourceMap = process.env.SOURCE_MAP === 'true';

    let workflow = rollup(Object.assign({}, ROLLUP_CONFIG, { rollup: require('rollup'), sourceMap })).pipe(source(basename(config.DEST_WEBSITE_BUNDLE_FILE))).pipe(buffer());

    if (sourceMap) {
      log('build:rollup', red('Source map is enabled, this build should not be used for production'));

      workflow = workflow
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify(UGLIFY_OPTIONS))
        .pipe(sourcemaps.write('.'));
    } else {
      workflow = workflow.pipe(uglify());
    }

    return workflow.pipe(gulp.dest(config.DEST_WEBSITE_BUNDLE_DIR));
  }
};
