# Advanced topics

This section helps you to dig deeper into the project.

## Important files and directories

| Filename | Description |
|----------------|-------------|
| `dist/` | Build output |
| `dist/website/` | Compiled web server ready to run by itself or hosted on IIS |
| `dist/website/public/` | Bundled content and static assets |
| `dist/packages/web.zip` | Web server packed by MSDeploy and ready to deploy to Azure Web Apps |
| [`src/app.js`](src/app.js) | Depends on `NODE_ENV`, development mode serves content directly from [`web/`](web/), production mode serves content from `dist/website/public` |
| [`src/controllers/api.js`](src/controllers/api.js) | RESTful API hosted at [http://localhost/api](http://localhost/api) |
| [`src/iisnode.yml`](src/iisnode.yml) | [iisnode configuration](https://tomasz.janczuk.org/2012/05/yaml-configuration-support-in-iisnode.html) |
| [`src/web.config`](src/web.config) | `Web.config` for hosting under Azure Web App and IIS |
| [`scripts/`](scripts) | Gulpfile for building and packing the project |
| [`web/files/`](web/files) | Asset source files |
| [`web/src/`](web/src) | JavaScript source files |

## NPM scripts

To help building the project, there are several NPM scripts.

| Task name     | Description |
| ------------- | ----------- |
| `build`       | Start the build process |
| `deploy`      | Deploy the website to Azure Web App |
| `host:dev`    | Host a Webpack development server and bundle on-the-fly |
| `host:prod`   | Host a production server using pre-bundled files at `dist/website/` |
| `pack`        | Use MSDeploy to pack everything at `dist/website/` into `dist/packages/web.zip` |

## Building the website

To build the website, run `npm run build`. The build output will be located at `dist/website/`.

* Specify build favor by either
  * Set environment variable `NODE_ENV` to `production`, or
  * Run `npm run build -- --build production`
* Specify bundler by either
  * Set environment variable `BUNDLER` to `rollup` or `webpack`, or
  * Run `npm run build -- --bundler rollup`

> Currently, the build favor (either `development` or `production`) is only used by [`transform-node-env-inline`](https://babeljs.io/docs/plugins/transform-node-env-inline/). It helps reducing bundle size by excluding developer-friendly error messages in production build.

### What the build do

Source code can be found at [`scripts/build.js`](scripts/build.js).

* Copy server code from [`src/`](src) to `dist/website/`, exclude `node_modules` folder
  * After copy complete, will run `npm install --ignore-scripts --only=production` to install fresh packages
* Bundle source files from [`web/src/`](web/src) to `dist/website/public/dist/bundle.js`
  * Will use existing npm packages from `web/node_modules`
* Copy static assets from [`web/files/`](web/files) to `dist/website/public/`
  * Will minify image with [`gulp-imagemin`](https://www.npmjs.com/package/gulp-imagemin/)
  * Will minify HTML with [`gulp-htmlmin`](https://www.npmjs.com/package/gulp-htmlmin/)

## Webpack configuration

The configuration file is located at [`web/webpack.config.js`](web/webpack.config.js). It controls how files are getting bundled into a monolithic `dist/website/public/js/bundle.js`.

* [`web/src/*.js`](web/src) and [`web/src/*.jsx`](web/src)
  * Bundled by [`babel-loader`](https://www.npmjs.com/package/babel-loader)
    * Enable React JSX by [`preset-react`](https://babeljs.io/docs/plugins/preset-react/)
    * Enable ES2015 by [`preset-es2015`](http://babeljs.io/docs/plugins/preset-es2015/)
    * Escape ES3 reserved keywords
      * [`transform-es3-member-expression-literals`](https://babeljs.io/docs/plugins/transform-es3-member-expression-literals/)
      * [`transform-es3-property-literals`](https://babeljs.io/docs/plugins/transform-es3-property-literals/)
    * Transform `process.env.NODE_ENV` into `"development"` or `"production"` with [`transform-node-env-inline`](https://babeljs.io/docs/plugins/transform-node-env-inline/)
  * Entrypoint is [`web/src/index.js`](web/src/index.js)
* [`web/src/*.css`](web/src) and [`web/src/*.less`](web/src)
  * Bundled by [`less-loader`](https://www.npmjs.com/package/less-loader), then
  * [`css-loader`](https://www.npmjs.com/package/css-loader), then
  * [`style-loader`](https://www.npmjs.com/package/style-loader)

> We use rollup.js for bundling in production build. Since rollup.js currently only support single entrypoint and not code-splitting. If you want to enable these features, please build with `--bundler webpack` to use Webpack as bundler in production build.

## Webpack development mode configuration

When running Webpack development server, additional configurations are required, for example, hot module replacement.

When running under development server, we will add the following to [`webpack.config.js`](web/webpack.config.js):

* Serve assets from [`web/files/`](web/files/)
* Enable [source map](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-tools)
  * Use absolute path for source map for compatibility with Edge
* Also write a copy of `bundle.js` to `dist/webpack/bundle.js` for debugging purpose
* Hot module replacement
  * Support React component with [`react-hot`](https://github.com/gaearon/react-hot-loader) loader

## Rollup.js configuration

The configuration file is located at [`web/rollup.config.js`](web/rollup.config.js). It is similar to Webpack configuration.

* TBD: ~~[`web/src/*.less`](web/src)~~
  * ~~Bundled by [`rollup-plugin-less`](https://npmjs.com/package/rollup-plugin-less)~~
    * ~~Inject CSS styles into `<head>`~~
* [`web/src/*.js`](web/src)
  * Bundled by [`rollup-plugin-babel`](https://www.npmjs.com/package/rollup-plugin-babel)
    * Enable ES2015 with [`preset-es2015`](http://babeljs.io/docs/plugins/preset-es2015/)
    * Enable React JSX with [`preset-react`](https://babeljs.io/docs/plugins/preset-react/)
    * Escape ES3 reserved keywords
      * [`transform-es3-member-expression-literals`](https://babeljs.io/docs/plugins/transform-es3-member-expression-literals/)
      * [`transform-es3-property-literals`](https://babeljs.io/docs/plugins/transform-es3-property-literals/)
    * Entrypoint is [`web/src/index.js`](web/src/index.js)
  * Bundled by [`rollup-plugin-commonjs`](https://www.npmjs.com/package/rollup-plugin-commonjs)
    * Convert CommonJS `require` statement into ES2015 `import` statement, including [`fbjs`](https://npmjs.com/package/fbjs), [`object-assign`](https://npmjs.com/package/object-assign), [`react`](https://npmjs.com/package/react), and [`react-dom`](https://npmjs.com/package/react-dom)
  * Bundled by [`rollup-plugin-replace`](https://www.npmjs.com/package/rollup-plugin-replace)
    * String-replace `process.env.NODE_ENV` into `"development"` or `"production"`
  * Bundled by [`rollup-plugin-node-resolve`](https://www.npmjs.com/package/rollup-plugin-node-resolve)
    * Bundle dependencies into `bundle.js`

## Enable source map output in production mode

Run `npm run build -- --sourcemap true` to output `dist/website/public/js/bundle.js.map` for debugging purpose.

## Packing with MSDeploy

To pack the content and production server, `npm run pack`.

It will create a MSDeploy ZIP file that can be deployed to any IIS server, including [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/). This ZIP file contains Express server code and website contents in production favor.

Additional parameters added to MSDeploy ZIP file:

| name                     | defaultValue       | tags     | kind           | scope    |
|--------------------------|--------------------|----------|----------------|----------|
| IIS Web Application Name | `Default Web Site` | `IisApp` | `ProviderPath` | `IisApp` |

Before packing the project, make sure your current build is up-to-date, or run `npm run build`.

> [MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy) is only supported on Windows.

## iisnode configuration

We have overrode some defaults in [`iisnode.yml`](iisnode.yml).

* `debuggingEnabled` is set to `false`
* `devErrorsEnabled` is set to `false`
* `loggingEnabled` is set to `false`
* `nodeProcessCountPerApplication` is set to `0`
  * One worker process per CPU
* `node_env` is set to `production`
  * We assume hosting the site in IIS is always in production mode
  * Express is faster when environment variable `NODE_ENV` is set to `production`, details [here](http://apmblog.dynatrace.com/2015/07/22/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/)
