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
| `prodserver/controllers/api.js` | RESTful API which will be mounted at `api/` |
| `prodserver/web.config` | `Web.config` for hosting the server under IIS with iisnode |
| `scripts/` | Gulpfile for building and packing the project |
| `web/public/` | Static web content (before build) |
| `web/src/` | Source JavaScript files (before build) |

## How to run the project

There are multiple NPM scripts help building the project.

* `npm run build` will use Webpack to build files, output as bundled files
* `npm run hostdev` will host a development server and compile on-the-fly
* `npm run hostprod` will host a production server using bundled files
* `npm run pack` will pack production server and bundled files into a ZIP file using MSDeploy

## Building the project

To compile the project, `npm run build`. The build output will be located at `dist/iisapp/`.

You can specify build favor by one of the two ways:
* Set environment variable `NODE_ENV` to `production`, or
* Run `npm run build -- -b production`

### What the build do

* Copies server code from `prodserver/` to `dist/iisapp/`, excluding `node_modules` folder
  * After copy complete, will run `npm install` again to install fresh npm packages
* Use Webpack to bundle from `web/src/` to `dist/iisapp/public/dist/bundle.js`
  * Will use existing npm packages from `web/node_modules` (Should we refresh packages too?)
* Copies static assets from `web/public/` to `dist/iisapp/public/`
  * (Need to add `pngout`)

### Webpack configuration

The configuration file is located at `web/webpack.config.js`. This file controls how files are getting bundled into `dist/bundle.js`.

* `web/src/*.js` and `web/src/*.jsx`
  * Bundled by `babel-loader`
    * Enable React preset
    * Enable ES2015 preset
    * [`transform-es3-member-expression-literals`](https://babeljs.io/docs/plugins/transform-es3-member-expression-literals/)
    * [`transform-es3-property-literals`](https://babeljs.io/docs/plugins/transform-es3-property-literals/)
    * [`transform-node-env-inline`](https://babeljs.io/docs/plugins/transform-node-env-inline/)
  * Entrypoint is `web/src/index.js`
* `web/src/*.css` and `web/src/*.less`
  * Bundled by `less-loader`, then
  * `css-loader`, then
  * `style-loader`

### Webpack development mode configuration

In addition to standard Webpack configuration, Webpack development server requires more setup (e.g. Hot module replacement).

The configuration file is located at `devserver/webpack.dev.config.js`.

When running under development server, we will add the following to `webpack.config.js`:

* Enable source map
  * Use absolute path for source map for compatibility with Edge
* Also write `bundle.js` to disk at `dist/webpack/bundle.js` for debugging purpose
* Hot module replacement
  * Support React component with [`react-hot`](https://github.com/gaearon/react-hot-loader) loader

## Hosting

There are three ways to host your project:

* Webpack development server
* Express production server (standalone)
* Express production server (on IIS using [iisnode](https://github.com/tjanczuk/iisnode))

### Webpack development server

To run the server, `npm run hostdev`. The server will host on port 80 at http://localhost/.

This is ideal for local development environment where network speed is not a concern.

Instead of serving a pre-compiled monolithic `dist/bundle.js`, the development server will serve each source files separately. This also enables hot module replacement: when a source file is modified, the browser will only reload that source file.

#### Serving order

* `*` if matching file exists, will be served from `web/public/*`
* `*.js` and `*.jsx` will be served on-demand by Webpack development server
* `api/` will be served by Express router at `prodserver/controllers/api.js`
* Otherwise, will be redirected to `web/public/index.html`
  * This is for supporting single-page application

### Express production server (standalone)

To run the server, `npm run hostprod`. The server is a simple Express server and host on port 80 at http://localhost/. All contents are served from `dist/iisapp/public/`.

Because the content need to be bundled by Webpack. After you modify your source at `web/src/` or assets at `web/public/`, you will need to run `npm run build` again to re-bundle the content to `dist/iisapp/public/`.

#### Serving order

* `*` if matching file exists, will be served from `dist/iisapp/public/*`
  * `dist/bundle.js` should be bundled by Webpack and will serve from `dist/iisapp/public/dist/bundle.js`
* `api/` will be served by Express router at `prodserver/controllers/api.js`
* Otherwise, will be redirected to `web/public/index.html`
  * This is for supporting single-page application

### Express production server (on IIS with iisnode)

Hosts the folder `dist/iisapp/` under IIS. This will run the Express production server managed by IIS.

iisnode configuration is located at `prodserver/web.config`. There are some overrides:

* `NODE_ENV` set to `production`
  * We assume hosting the site in IIS is always production ready
  * Express is faster when `NODE_ENV` is set, details [here](http://apmblog.dynatrace.com/2015/07/22/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/)
* Look for Node.js binaries at `C:\Program Files\nodejs\6.1.0\node.exe`
  * This is to support Azure Web App

## Packing for Azure Web App

To pack the content and production server, `npm run pack`. It will use MSDeploy to pack everything from `dist/iisapp/` and make it ready for deployment on Azure Web App.

Before packing the project, make sure your current build is up to date, run `npm run build`.

MSDeploy can be installed using [Web Platform Installer](https://www.microsoft.com/web/downloads/platform.aspx).
