# webpack-template

Web site template with [React](https://facebook.github.io/react/), [Webpack](https://webpack.github.io/), [hot module replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html), and [MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy).

## Introduction

Modern websites are not bunches of plain text files. Build process increases page load efficiency and overall page performance. This process involves:

* Concatenating multiple JavaScript files into a single file (a.k.a. bundling)
* Obfuscate and minify JavaScript files
* Re-compress JPEG and PNG files for better compression ratio
* Remove dead code or code that is only used in development mode

We use Webpack as a bundler for our build process. And the folder structure is designed to be able to host under IIS on [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/).

## Work in progress

These are items we are working on or under consideration:

* [ ] Add [pngout](http://www.advsys.net/ken/utils.htm) to `npm run build`
* [ ] Continuous deployment on Azure Web Apps
  * `npm install` should build
  * `.deployment` file for Kudu to specify project folder at `dist/iisapp/`
* [ ] Use a single `package.json` if possible

## First time preparation

Run `npm install`. This will install all dependencies for the following package manifests:

* [`devserver/package.json`](devserver/package.json)
* [`prodserver/package.json`](prodserver/package.json)
* [`scripts/package.json`](scripts/package.json)
* [`web/package.json`](web/package.json)

Do not save dependencies on the root [`package.json`](package.json). These packages will not be packed into MSDeploy, and thus, will become missing dependencies when deployed.

## Important files and directories

| Filename | Description |
|----------------|-------------|
| [`devserver/`](devserver) | Webpack development server, serving content from [`web/public/`](web/public) and [`web/src/`](web/src) |
| `dist/` | Build output |
| `dist/iisapp/` | Compiled web server ready to run by itself or hosted on IIS |
| `dist/iisapp/public/` | Bundled content and static assets |
| `dist/packages/web.zip` | Web server packed by MSDeploy and ready to deploy to Azure Web Apps |
| [`prodserver/`](prodserver) | Express production server |
| [`prodserver/controllers/api.js`](prodserver/controllers/api.js) | RESTful API for [http://localhost/api](http://localhost/api) |
| [`prodserver/web.config`](prodserver/web.config) | `Web.config` for hosting the server under IIS with iisnode |
| [`scripts/`](scripts) | Gulpfile for building and packing the project |
| [`web/public/`](web/public) | Static web content (before build) |
| [`web/src/`](web/src) | Source JavaScript files (before bundle) |

## How to run the project

There are multiple NPM scripts help building the project.

* `npm run build` will use Webpack to bundle source files
* `npm run hostdev` will host a development server and compile on-the-fly
* `npm run hostprod` will host a production server using bundled files
* `npm run pack` will pack production server and bundled files into a ZIP file using MSDeploy

## Building the website

To build the website, `npm run build`. The build output will be located at `dist/iisapp/`.

You can specify production build by:

* Set environment variable `NODE_ENV` to `production`, or
* Run `npm run build -- --build production`

Currently, the build favor (either `development` or `production`) is only used by [`transform-node-env-inline`](https://babeljs.io/docs/plugins/transform-node-env-inline/). It helps reducing bundle size by excluding developer-friendly error messages in production build.

### What the build do

* Copy server code from [`prodserver/`](prodserver) to `dist/iisapp/`, exclude `node_modules` folder
  * After copy complete, will run `npm install` again to install fresh npm packages
* Bundle source files from [`web/src/`](web/src) to `dist/iisapp/public/dist/bundle.js`
  * Will use existing npm packages from `web/node_modules` (Should we refresh packages too?)
* Copy static assets from [`web/public/`](web/public) to `dist/iisapp/public/`
  * (Need to add `pngout`)

### Webpack configuration

The configuration file is located at [`web/webpack.config.js`](web/webpack.config.js). It controls how files are getting bundled into `dist/bundle.js`.

* [`web/src/*.js`](web/src) and [`web/src/*.jsx`](web/src)
  * Bundled by [`babel-loader`](https://www.npmjs.com/package/babel-loader)
    * Enable React JSX with [`preset-react`](https://babeljs.io/docs/plugins/preset-react/)
    * Enable ES2015 with [`preset-es2015`](http://babeljs.io/docs/plugins/preset-es2015/)
    * Escape ES3 reserved keywords
      * [`transform-es3-member-expression-literals`](https://babeljs.io/docs/plugins/transform-es3-member-expression-literals/)
      * [`transform-es3-property-literals`](https://babeljs.io/docs/plugins/transform-es3-property-literals/)
    * Transform `process.env.node_env` into `"development"` or `"production"` with [`transform-node-env-inline`](https://babeljs.io/docs/plugins/transform-node-env-inline/)
  * Entrypoint is [`web/src/index.js`](web/src/index.js)
* [`web/src/*.css`](web/src) and [`web/src/*.less`](web/src)
  * Bundled by [`less-loader`](https://www.npmjs.com/package/less-loader), then
  * [`css-loader`](https://www.npmjs.com/package/css-loader), then
  * [`style-loader`](https://www.npmjs.com/package/style-loader)

### Webpack development mode configuration

When running Webpack development server, additional configurations are required, e.g. hot module replacement.

The configuration file is located at [`devserver/webpack.dev.config.js`](devserver/webpack.dev.config.js).

When running under development server, we will add the following to [`webpack.config.js`](web/webpack.config.js):

* Serve assets from [`web/public/`](web/public)
* Enable source map
  * Use absolute path for source map for compatibility with Edge
* Also write a copy of `bundle.js` to `dist/webpack/bundle.js` for debugging purpose
* Hot module replacement
  * Support React component with [`react-hot`](https://github.com/gaearon/react-hot-loader) loader

## Hosting

There are three ways to host your project:

* Webpack development server
  * Bundle on-the-fly, shorter build time
  * Support [hot module replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html) (supersede [LiveReload](http://livereload.com/))
  * Not recommended to serve over network
* Express production server (standalone)
  * Production ready
* Express production server (on IIS using [iisnode](https://github.com/tjanczuk/iisnode))
  * Host on [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/) or on-premise

### Webpack development server

To run the server, `npm run hostdev`. The server will host on port 80 at [http://localhost/](http://localhost/).

You can specify hosting port by:

* Set environment variable `PORT` to `8080`, or
* Command-line switches: `npm run hostdev -- --port 8080`

The server targets local development environment where network speed is not a concern.

Instead of serving a monolithic bundle `dist/bundle.js`, the development server will serve each source files separately. This also enables hot module replacement, when a source file is modified, the browser will only reload that source file and/or re-render related React component.

#### Serving order

* `dist/bundle.js` will be bundled by Webpack on-the-fly
* `*` if matching file exists, will be served from [`web/public/*`](web/public)
* `api/` will be served by Express router at [`prodserver/controllers/api.js`](prodserver/controllers/api.js)
* Otherwise, will redirect to [`web/public/index.html`](web/public/index.html)
  * To support single-page application

### Express production server (standalone)

To run the server, `npm run hostprod`.

The server is a simple Express server which host on port 80 at [http://localhost/](http://localhost/). All contents are served from `dist/iisapp/public/`.

You can specify hosting port by:

* Set environment variable `PORT` to `8080`, or
* Command-line switches: `npm run hostprod -- --port 8080`

Because the server serve contents from `dist/iisapp/public/`. After you modify your source files at [`web/src/`](web/src) or assets at [`web/public/`](web/public), you will need to rerun `npm run build` to rebuild the content to `dist/iisapp/public/`.

#### Serving order

* `*` if matching file exists, will be served from `dist/iisapp/public/*`
  * Also serve bundled `dist/bundle.js`
* `api/` will be served by Express router at [`prodserver/controllers/api.js`](prodserver/controllers/api.js)
* Otherwise, will be redirected to [`web/public/index.html`](web/public/index.html)
  * To support single-page application

### Express production server (on IIS with iisnode)

To run the Express server under IIS, host the folder `dist/iisapp/` under IIS with [iisnode](https://github.com/tjanczuk/iisnode).

iisnode configuration is located at `prodserver/web.config`. We have overrode some defaults:

* `node_env` set to `production`
  * We assume hosting the site in IIS is always in production mode
  * Express is faster when environment variable `NODE_ENV` is set to `production`, details [here](http://apmblog.dynatrace.com/2015/07/22/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/)
* Look for Node.js binaries at `C:\Program Files\nodejs\6.1.0\node.exe`
  * To support multiple Node.js versions on Azure Web Apps

## Packing for Azure Web App

To pack the content and production server, `npm run pack`.

MSDeploy is used to pack everything under `dist/iisapp/` plus additional metadata needed for [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/).

| name                     | defaultValue       | tags     | kind           | scope    |
|--------------------------|--------------------|----------|---------------|----------|
| IIS Web Application Name | `Default Web Site` | `IisApp` | `ProviderPath` | `IisApp` |

Before packing the project, make sure your current build is up to date, run `npm run build`.

MSDeploy can be installed using [Web Platform Installer](https://www.microsoft.com/web/downloads/platform.aspx).
