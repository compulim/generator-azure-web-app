# webpack-template

Web site template with React, Webpack, hot module replacement, and MSDeploy.

## First-time preparation

Run `npm install`. This will install all dependencies for the following package manifests:

* `devserver/package.json`
* `prodserver/package.json`
* `scripts/package.json`
* `web/package.json`

Warning: Do not save dependencies on the root `package.json`. These packages will not be packed into MSDeploy, and thus, become missing dependencies on a deployed production server.

## Important files and directories

| Filename | Description |
|----------------|-------------|
| `devserver/` | Webpack development server |
| `dist/iisapp/` | Compiled website content, ready to be served by production server and IIS |
| `dist/packages/` | Website content packed by MSDeploy and ready for Azure Web App |
| `prodserver/` | Express production server |
| `prodserver/web.config` | Web.config for hosting under IIS with iisnode |
| `scripts/` | Gulpfile for building and packing the project |
| `web/public/` | Static web content |
| `web/src/` | JavaScript files to be bundled by Webpack |

## Building the project

This is a modern website template and it requires compilation to work.

To compile the project, `npm run build`. The build output will be located at `dist/iisapp/`.

### Build gulpfile

* Copies files from `prodserver` to `dist/iisapp/`, excluding `node_modules` folder
  * Will run `npm install` after copy complete, to refresh `node_modules`
* Webpack to bundle from `web/src/` to `dist/iisapp/public/dist/bundle.js`
  * Will use existing npm packages from `web/node_modules` (Should we change this?)
* Copies static assets from `web/public/` to `dist/iisapp/public/`

### Webpack configuration

The configuration file is located at `web/webpack.config.js`.

* `*` will be served from `web/public`, otherwise will fallthrough
* Bundle `dist/bundle.js` contains content from:
  * `web/src/*.js` and `web/src/*.jsx`
    * Served by `babel-loader`
      * React preset
      * ES2015 preset
      * `transform-es3-member-expression-literals`
      * `transform-es3-property-literals`
      * `transform-node-env-inline`
    * Entrypoint is `web/src/index.js`
  * `web/src/*.css` and `web/src/*.less`
    * `style-loader`
    * `css-loader`
    * `less-loader`
* Other requests will be redirected to `web/public/index.html`

### Webpack development mode configuration

The configuration file is located at `devserver/webpack.dev.config.js`.

When running in development mode, will add the following in addition to the standard Webpack configuration:

* Enable source map
  * Use absolute path for source map for compatibility with Edge
* Also write `bundle.js` to disk at `dist/webpack/bundle.js` for debugging purpose
* Hot module replacement
  * Support React component reloading using `react-hot` module

## Hosting

There are three ways to host your project:

* Webpack development server
* Express production server
* IIS with iisnode

### Webpack development server

To run the server, `npm run hostdev`. The server will be hosted on port 80 at http://localhost/.

This is ideal for local development environment where network speed is not a concern.

Instead of serving a pre-compiled monolithic `dist/bundle.js`, the development server will serve each source files separately. This also enables Hot Module Replacement: when a source file is modified, the browser will only reload that source file.

#### Serving order

* `*` if matching file exists, will be served from `web/public/*`
* `*.js` and `*.jsx` will be served on-demand by Webpack development server
* `api/` is routed to Express router at `prodserver/controllers/api.js`
* Otherwise, will be redirected to `web/public/index.html`
  * This is for supporting single-page application

### Express production server

To run the server, `npm run hostprod`. The server is a simple Express server and hosted on port 80 at http://localhost/.

Because the content need to be prepared by Webpack. When your source files at `web/src/` has modified, you will need to run `npm run build` to rebuild the content.

#### Serving order

* `*` if matching file exists, will be served from `dist/iisapp/public/*`
  * `dist/bundle.js` should be compiled by Webpack and served from `dist/iisapp/public/dist/bundle.js`
* `api/` is routed to Express router at `prodserver/controllers/api.js`
* Otherwise, will be redirected to `web/public/index.html`
  * This is for supporting single-page application

### IIS with iisnode

Hosts the folder `dist/iisapp/` under IIS. This will run the Express production server managed by IIS.

iisnode configuration is located at `prodserver/web.config`. There are some overrides:

* `NODE_ENV` set to `production`
  * We assumes hosting the site in IIS is always production ready
  * Express is faster when `NODE_ENV` is set, details [here](http://apmblog.dynatrace.com/2015/07/22/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/)
* Look for Node.js installation at `C:\Program Files\nodejs\6.1.0\node.exe`
  * This is to support Azure Web App

## Packing for Azure Web App

To pack the content and production server, `npm run pack`. It will run MSDeploy to pack all compiled contents from `dist/iisapp/` and ready for deployment on Azure Web App.

Before packing the project, make sure your current build is up to date, run `npm run build`.

MSDeploy is required for packing. It can be installed using [Web Platform Installer](https://www.microsoft.com/web/downloads/platform.aspx).
