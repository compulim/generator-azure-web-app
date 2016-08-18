# webpack-template

Web site template with React, Webpack, hot module replacement, and MSDeploy.

## First time preparation

Run `npm install`. This will install all dependencies for the following package manifests:

* `devserver/package.json`
* `prodserver/package.json`
* `scripts/package.json`
* `web/package.json`

Do not save dependencies on the root `package.json`. These packages will not be packed into MSDeploy, and thus, will become missing dependencies when deployed.

## Important files and directories

| Filename | Description |
|----------------|-------------|
| `devserver/` | Webpack development server, serving content from `web/public/` and `web/src/` |
| `dist/` | Build output |
| `dist/iisapp/` | Compiled web server ready to run by itself or hosted on IIS |
| `dist/iisapp/public/` | Bundled content and static assets |
| `dist/packages/web.zip` | Web server packed by MSDeploy and ready to deploy to Azure Web App |
| `prodserver/` | Express production server |
| `prodserver/controllers/api.js` | RESTful API for http://localhost/api |
| `prodserver/web.config` | `Web.config` for hosting the server under IIS with iisnode |
| `scripts/` | Gulpfile for building and packing the project |
| `web/public/` | Static web content (before build) |
| `web/src/` | Source JavaScript files (before bundle) |

## How to run the project

There are multiple NPM scripts help building the project.

* `npm run build` will use Webpack to bundle source files
* `npm run hostdev` will host a development server and compile on-the-fly
* `npm run hostprod` will host a production server using bundled files
* `npm run pack` will pack production server and bundled files into a ZIP file using MSDeploy

## Building the project

To build the project, `npm run build`. The build output will be located at `dist/iisapp/`.

You can specify build favor by:
* Set environment variable `NODE_ENV` to `production`, or
* Run `npm run build -- -b production`

### What the build do

* Copy server code from [`prodserver/`](prodserver) to `dist/iisapp/`, exclude `node_modules` folder
  * After copy complete, will run `npm install` again to install fresh npm packages
* Bundle source files from [`web/src/`](web/src) to `dist/iisapp/public/dist/bundle.js`
  * Will use existing npm packages from `web/node_modules` (Should we refresh packages too?)
* Copy static assets from [`web/public/`](web/public) to `dist/iisapp/public/`
  * (Need to add `pngout`)

### Webpack configuration

The configuration file is located at [`web/webpack.config.js`](web/webpack.config.js). This file controls how files are getting bundled into `dist/bundle.js`.

* [`web/src/*.js`](web/src) and [`web/src/*.jsx`](web/src)
  * Bundled by [`babel-loader`](https://www.npmjs.com/package/babel-loader)
    * Enable React preset
    * Enable ES2015 preset
    * [`transform-es3-member-expression-literals`](https://babeljs.io/docs/plugins/transform-es3-member-expression-literals/)
    * [`transform-es3-property-literals`](https://babeljs.io/docs/plugins/transform-es3-property-literals/)
    * [`transform-node-env-inline`](https://babeljs.io/docs/plugins/transform-node-env-inline/)
  * Entrypoint is [`web/src/index.js`](web/src/index.js)
* [`web/src/*.css`](web/src) and [`web/src/*.less`](web/src)
  * Bundled by [`less-loader`](https://www.npmjs.com/package/less-loader), then
  * [`css-loader`](https://www.npmjs.com/package/css-loader), then
  * [`style-loader`](https://www.npmjs.com/package/style-loader)

### Webpack development mode configuration

When running Webpack development server, additional configurations is required (e.g. hot module replacement).

The configuration file is located at [`devserver/webpack.dev.config.js`](devserver/webpack.dev.config.js).

When running under development server, we will add the following to [`webpack.config.js`](web/webpack.config.js):

* Enable source map
  * Use absolute path for source map for compatibility with Edge
* Also write a copy of `bundle.js` to `dist/webpack/bundle.js` for debugging purpose
* Hot module replacement
  * Support React component with [`react-hot`](https://github.com/gaearon/react-hot-loader) loader

## Hosting

There are three ways to host your project:

* Webpack development server
* Express production server (standalone)
* Express production server (on IIS using [iisnode](https://github.com/tjanczuk/iisnode))

### Webpack development server

To run the server, `npm run hostdev`. The server will host on port 80 at http://localhost/.

You can specify hosting port by:

* Set envrionment variable `PORT` to `8080`, or,
* Command-line switches: `npm run hostdev -- --port 8080`

This server target local development environment where network speed is not a concern.

Instead of serving a pre-compiled monolithic `dist/bundle.js`, the development server will serve each source files separately. This also enables hot module replacement: when a source file is modified, the browser will only reload that source file and/or React component.

#### Serving order

* `dist/bundle.js` will be bundled by Webpack on-the-fly
* `*` if matching file exists, will be served from [`web/public/*`](web/public)
* `api/` will be served by Express router at [`prodserver/controllers/api.js`](prodserver/controllers/api.js)
* Otherwise, will be redirected to [`web/public/index.html`](web/public/index.html)
  * This is for supporting single-page application

### Express production server (standalone)

To run the server, `npm run hostprod`.

The server is a simple Express server which host on port 80 at http://localhost/. All contents are served from `dist/iisapp/public/`.

You can specify hosting port by:

* Set environment variable `PORT` to `8080`, or,
* Command-line switches: `npm run hostprod -- --port 8080`

Because the server serve bundled contents at `dist/iisapp/public/`. After you modify your source files at [`web/src/`](web/src) or assets at [`web/public/`](web/public), you will need to rerun `npm run build` to rebuild the content at `dist/iisapp/public/`.

#### Serving order

* `*` if matching file exists, will be served from `dist/iisapp/public/*`
  * Also serve bundled `dist/bundle.js`
* `api/` will be served by Express router at [`prodserver/controllers/api.js`](prodserver/controllers/api.js)
* Otherwise, will be redirected to [`web/public/index.html`](web/public/index.html)
  * This is for supporting single-page application

### Express production server (on IIS with iisnode)

To run the Express server under IIS, host the folder `dist/iisapp/` under IIS.

iisnode configuration is located at `prodserver/web.config`. There are some overrides:

* `node_env` set to `production`
  * We assume hosting the site in IIS is always production ready
  * Express is faster when environment variable `NODE_ENV` is set to `production`, details [here](http://apmblog.dynatrace.com/2015/07/22/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/)
* Look for Node.js binaries at `C:\Program Files\nodejs\6.1.0\node.exe`
  * This is to support multiple Node.js versioning on Azure Web App

## Packing for Azure Web App

To pack the content and production server, `npm run pack`.

MSDeploy is used to pack everything under `dist/iisapp/` plus additional metadata needed for Azure Web App.

| name | defaultValue | tags | kind | scope |
|-|-|-|-|-|
| IIS Web Application Name | `Default Web Site` | `IisApp` | `ProviderPath` | `IisApp` |

Before packing the project, make sure your current build is up to date, run `npm run build`.

MSDeploy can be installed using [Web Platform Installer](https://www.microsoft.com/web/downloads/platform.aspx).
