# modern-web-template

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

Website template with [React](https://facebook.github.io/react/), [Webpack](https://webpack.github.io/), [hot module replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html), [Express](https://expressjs.com/), and [rollup.js](http://rollupjs.org/). [MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy) to prepare deployment for [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/).

## Introduction

Modern websites are not bunches of plain text files. Build process increases page load efficiency and overall page performance. This process involves:

* Concatenating multiple JavaScript files into a single file (a.k.a. bundling)
* Obfuscate and minify JavaScript files
* Re-compress JPEG and PNG files for better compression ratio
* Remove dead code or code that is only used in development mode

We use Webpack and rollup.js as a bundler for our build process. And the directory structure is designed to be able to host as a standalone Node.js server or IIS on [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/) and [Azure VM](https://azure.microsoft.com/en-us/services/virtual-machines/).

Notes: we recently moved to rollup.js for bundling in production mode, and Webpack development server in development mode. `Rollup.js` has better tree-shaking algorithm and less clunky source code.

## Try it out in 3 steps

1. Fork this repository
2. Click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)
3. Commit your changes and see it continuously deploy to Azure

It takes about 5-10 minutes to build for the first time (due to large npm install), have a little patience.

## How to develop on it in a professional way

### First time preparation

Clone it to your dev box. Then run `npm install`.

### Run development server

Run `npm run hostdev`, the development server will listen to port 80 and available at [http://localhost/](http://localhost/).

### Develop your site

#### Adding new contents

For clarity, HTML pages and JavaScript code are separated into different folders.

* HTML pages or assets
  * Create new HTML file at [`web/public/`](web/public)
  * Save assets to [`web/public/`](web/public)
* JavaScript code
  * Create new JavaScript file at [`web/src/`](web/src)
  * To import packages, mark them as development dependencies, for example, `npm install react --save-dev`

#### Adding new API endpoints

Add new API endpoints at [`prodserver/controllers/api.js`](prodserver/controllers/api.js).

To import packages, mark them as production dependencies, for example, `npm install serve-static --save`.

Lastly, restart the development server to pick up your new code.

### Production deployment

Then, there are multiple ways to host the server:

* Host with vanilla Node.js
* Host with Azure Web App
  * Continuous integration: deploy via GitHub
  * Controlled release: deploy using MSDeploy
* Host with IIS

##### Host with vanilla Node.js

Build the website, run `npm run build`. Then under `dist/iisapp/`, run `node server.js`.

The directory `dist/iisapp/` contains everything that need to run the production server, including minified HTML files and assets. It can be copied to production server to run.

For load-balancing and scalability, it is recommended to use a process lifecycle manager to manage the server process. For example, [PM2](https://www.npmjs.com/package/pm2).

##### Host with Azure Web App

(Due to a [bug](https://github.com/nodejs/node/issues/7175#issuecomment-239824532) in Node.js, Webpack is not working on Azure with Node.js >= 6.0.0 and < 6.4.0)

There are two deployment options for Azure Web App:

* Deploy via GitHub (Recommended)
  * As you push new commits to GitHub, your Azure Web App will pick them up and deploy immediately
  * Click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/) to start
* Deploy using MSDeploy
  * For manual or controlled release, for example, deploy thru release manager, for example, [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx)
  * Download publish settings file from [Azure Dashboard](https://portal.azure.com/) or using [Azure PowerShell](https://msdn.microsoft.com/en-us/library/dn385850(v=nav.70).aspx)
  * Modify iisnode configuration to select Node.js version
    * When deployed thru MSDeploy, [`iisnode.yml`](iisnode.yml) is not updated automatically, thus Node.js version cannot be selected automatically
    * Add a line to [`iisnode.yml`](iisnode.yml): `nodeProcessCommandLine: "D:\Program Files (x86)\nodejs\6.6.0\node.exe"`
  * Then, run `npm run build`, to build the website to `dist/iisapp/`
  * Then, run `npm run pack`, to pack the website as `dist/packages/web.zip`
  * Then, run `npm run deploy --publishsettings=yoursite.PublishSettings`

##### Host with IIS

This will use IIS Management Service feature to deploy the site.

1. Run `npm run build`, to build the website and output to `dist/iisapp/`
2. Then, run `npm run pack`, to pack the website as `dist/packages/web.zip`
3. Then, use MSDeploy to deploy the package to your IIS

## Advanced: Important files and directories

| Filename | Description |
|----------------|-------------|
| [`devserver/`](devserver) | Webpack development server, serve content from [`web/public/`](web/public) and [`web/src/`](web/src) |
| `dist/` | Build output |
| `dist/iisapp/` | Compiled web server ready to run by itself or hosted on IIS |
| `dist/iisapp/public/` | Bundled content and static assets |
| `dist/packages/web.zip` | Web server packed by MSDeploy and ready to deploy to Azure Web Apps |
| [`prodserver/`](prodserver) | Express production server, serve content from `dist/iisapp/public` |
| [`prodserver/controllers/api.js`](prodserver/controllers/api.js) | RESTful API for [http://localhost/api](http://localhost/api) |
| [`prodserver/iisnode.yml`](prodserver/iisnode.yml) | [iisnode](https://github.com/tjanczuk/iisnode) configuration |
| [`prodserver/web.config`](prodserver/web.config) | `Web.config` for hosting under IIS with [iisnode](https://github.com/tjanczuk/iisnode) |
| [`scripts/`](scripts) | Gulpfile for building and packing the project |
| [`web/public/`](web/public) | Asset source files |
| [`web/src/`](web/src) | JavaScript source files |

## Advanced: Gulp tasks

To help building the project, there are several Gulp tasks exposed thru NPM scripts.

* `npm run build` will start the build process
* `npm run deploy` will deploy the website to Azure Web App
* `npm run hostdev` will host a development server and bundle on-the-fly
* `npm run hostprod` will host a production server using pre-bundled files
* `npm run pack` will pack production server and bundled files into a ZIP file using MSDeploy

## Advanced: Building the website

To build the website, `npm run build`. The build output will be located at `dist/iisapp/`.

You can specify production build by:

* Set environment variable `NODE_ENV` to `production`, or
* Run `npm run build -- --build production`

Currently, the build favor (either `development` or `production`) is only used by [`transform-node-env-inline`](https://babeljs.io/docs/plugins/transform-node-env-inline/). It helps reducing bundle size by excluding developer-friendly error messages in production build.

You can select between [rollup.js](http://rollupjs.org/) (default) and [Webpack](https://webpack.github.io/) as your bundler for production mode.

### What the build do

* Copy server code from [`prodserver/`](prodserver) to `dist/iisapp/`, exclude `node_modules` folder
  * After copy complete, will run `npm install` to install fresh production-only packages
* Bundle source files from [`web/src/`](web/src) to `dist/iisapp/public/dist/bundle.js`
  * Will use existing npm packages from `web/node_modules`
* Copy static assets from [`web/public/`](web/public) to `dist/iisapp/public/`
  * Will minify image with [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin/)
  * Will minify HTML with [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin/)

### Webpack configuration

The configuration file is located at [`web/webpack.config.js`](web/webpack.config.js). It controls how files are getting bundled into a monolithic `dist/bundle.js`.

* [`web/src/*.js`](web/src) and [`web/src/*.jsx`](web/src)
  * Bundled by [`babel-loader`](https://www.npmjs.com/package/babel-loader)
    * Enable React JSX with [`preset-react`](https://babeljs.io/docs/plugins/preset-react/)
    * Enable ES2015 with [`preset-es2015`](http://babeljs.io/docs/plugins/preset-es2015/)
    * Escape ES3 reserved keywords
      * [`transform-es3-member-expression-literals`](https://babeljs.io/docs/plugins/transform-es3-member-expression-literals/)
      * [`transform-es3-property-literals`](https://babeljs.io/docs/plugins/transform-es3-property-literals/)
    * Transform `process.env.NODE_ENV` into `"development"` or `"production"` with [`transform-node-env-inline`](https://babeljs.io/docs/plugins/transform-node-env-inline/)
  * Entrypoint is [`web/src/index.js`](web/src/index.js)
* [`web/src/*.css`](web/src) and [`web/src/*.less`](web/src)
  * Bundled by [`less-loader`](https://www.npmjs.com/package/less-loader), then
  * [`css-loader`](https://www.npmjs.com/package/css-loader), then
  * [`style-loader`](https://www.npmjs.com/package/style-loader)

### Webpack development mode configuration

When running Webpack development server, additional configurations are required, for example, hot module replacement.

The configuration file is located at [`devserver/webpack.dev.config.js`](devserver/webpack.dev.config.js).

When running under development server, we will add the following to [`webpack.config.js`](web/webpack.config.js):

* Serve assets from [`web/public/`](web/public)
* Enable [source map](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-tools)
  * Use absolute path for source map for compatibility with Edge
* Also write a copy of `bundle.js` to `dist/webpack/bundle.js` for debugging purpose
* Hot module replacement
  * Support React component with [`react-hot`](https://github.com/gaearon/react-hot-loader) loader

### Rollup.js configuration

Rollup.js bundler is used only in production mode.

The configuration file is located at [`web/rollup.config.js`](web/rollup.config.js). It is similar to Webpack configuration.

* [`web/src/*.less`](web/src)
  * Bundled by [`rollup-plugin-less`](https://npmjs.com/package/rollup-plugin-less)
    * Inject CSS styles into `<head>`
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

### Enable source map output in production mode

Run `npm run build -- --sourcemap true` to output `dist/bundle.js.map` for debugging purpose.

## Advanced: Hosting with Webpack development server

The server targets local development environment where network speed is not a concern.

Instead of serving a monolithic bundle `dist/bundle.js`, the development server will serve each source files separately. This also enables hot module replacement, when a source file is modified, the browser will only reload that source file and/or re-render related React component.

### Features

* Bundle on-the-fly, shorter build time
* Support [hot module replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html) (supersede [LiveReload](http://livereload.com/))

### Options

* Listening port
  * Set environment variable `PORT` to `8080`, or
  * Command-line switches: `npm run hostdev -- --port 8080`

### File serving order

* `dist/bundle.js` will be bundled by Webpack on-the-fly
* `*` if matching file exists, will be served from [`web/public/*`](web/public)
* `api/` will be served by Express router at [`prodserver/controllers/api.js`](prodserver/controllers/api.js)
* Otherwise, will redirect to [`web/public/index.html`](web/public/index.html)
  * To support single-page application

## Advanced: Hosting as a standalone Express server

The server is a simple Express server which host on port 80 at [http://localhost/](http://localhost/). All contents are served from `dist/iisapp/public/`.

### Features

* Cross-platform
* Simple deployment
* Recommended to host under a process lifecycle manager, for example, [PM2](https://www.npmjs.com/package/pm2)

### Options

* Listening port
  * Set environment variable `PORT` to `8080`, or
  * Command-line switches: `npm run hostprod -- --port 8080`

### File serving order

* `*` if matching file exists, will be served from `dist/iisapp/public/*`
  * Also serve bundle `dist/bundle.js` from `dist/iisapp/public/dist/bundle.js`
* `api/` will be served by Express router at [`prodserver/controllers/api.js`](prodserver/controllers/api.js)
* Otherwise, will be redirected to [`web/public/index.html`](web/public/index.html)
  * To support single-page application

### Notes

Because the contents are served from `dist/iisapp/public/`. After you modify your source files at [`web/src/`](web/src) or assets at [`web/public/`](web/public), you will need to rerun `npm run build` to rebuild the content to `dist/iisapp/public/`.

## Advanced: Hosting with IIS and iisnode

This scenario is designed for deploying server code to [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/), [Azure VM](https://azure.microsoft.com/en-us/services/virtual-machines/), and on-premise IIS.

[iisnode](https://github.com/tjanczuk/iisnode) configuration is located at `iisnode.yml`. We have overrode some defaults:

* `debuggingEnabled` is set to `false`
* `devErrorsEnabled` is set to `false`
* `loggingEnabled` is set to `false`
* `nodeProcessCountPerApplication` is set to `0`
  * One worker process per CPU
* `node_env` is set to `production`
  * We assume hosting the site in IIS is always in production mode
  * Express is faster when environment variable `NODE_ENV` is set to `production`, details [here](http://apmblog.dynatrace.com/2015/07/22/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/)

### Features

* Can be deployed to [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/), [Azure VM](https://azure.microsoft.com/en-us/services/virtual-machines/), and on-premise IIS
* IIS-managed worker process lifecycle
  * Auto recycle worker process as needed (hitting memory or CPU limit, or after number of hours)
* Fast and efficient serving on static files using kernel-mode driver (http.sys)

### File serving order

Largely same as hosting with standalone Express server. Except when serving `*`, files will be served directly by IIS and not passing thru [iisnode](https://github.com/tjanczuk/iisnode) or [Express](https://expressjs.com/). Static files served by IIS will be served and cached by [kernel-mode driver](https://technet.microsoft.com/en-us/library/cc740087(v=ws.10).aspx) (http.sys).

## Advanced: Packing with MSDeploy

(This scenario is only supported on Windows because it requires [MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy).)

To pack the content and production server, `npm run pack`.

It will create a MSDeploy ZIP file that can be deployed to any IIS server, including [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/). This ZIP file contains Express server code and website contents in production favor.

Additional parameters added to MSDeploy ZIP file:

| name                     | defaultValue       | tags     | kind           | scope    |
|--------------------------|--------------------|----------|----------------|----------|
| IIS Web Application Name | `Default Web Site` | `IisApp` | `ProviderPath` | `IisApp` |

Before packing the project, make sure your current build is up-to-date, or run `npm run build`.

## Advanced: Continuous deployment for Azure Web App

This project can be deployed to [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/) using continuous deployment with GitHub. Azure Web App is powered by [Project Kudu](https://github.com/projectkudu/kudu).

To deploy to Azure, please click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/), or refer to this [article](https://azure.microsoft.com/en-us/documentation/articles/app-service-continous-deployment/).

To run Webpack on Azure, we prepared a [custom deployment script](https://github.com/projectkudu/kudu/wiki/Custom-Deployment-Script) for Project Kudu.

* Copy source files to intermediate folder (under `D:\home\site\intermediate\`)
* Build the project (by running `npm install`)
* Copy server and bundles from `D:\home\site\intermediate\dist\iisapp\` to `D:\home\site\wwwroot\`
* Update [`iisnode.yml`](iisnode.yml) by selecting Node.js version from engines in [`package.json`](package.json)
  * Currently, there is a [bug](https://github.com/webpack/memory-fs/issues/23) in Webpack that prevent us to use Node.js >= 6.0.0 to bundle

## Advanced: Manual deploy to Azure Web App

(This command is only supported on Windows because it requires MSDeploy)

This scenario is designed for manual or controlled release. Mostly paired with a release management tool, for example, [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx).

Deployment thru MSDeploy will not trigger Project Kudu. Thus, Node.js version and binary location cannot be automatically selected from [`package.json`](package.json). Please add the followings to `iisnode.yml`:

* `nodeProcessCommandLine: "D:\Program Files (x86)\nodejs\6.6.0\node.exe"`

Then, build the server, `npm run build`. This will output to `dist/iisapp/`.

Then, pack the web server, `npm run pack`. This will output a MSDeploy package file at `dist/packages/web.zip`.

Then, deploy the package file to Azure Web App, `npm run deploy -- --publishsettings=<yoursettings>.PublishSettings`.

The publish settings file can be downloaded from [Azure Dashboard](https://portal.azure.com/) or using [Azure PowerShell](https://msdn.microsoft.com/en-us/library/dn385850(v=nav.70).aspx).

## Advanced: Manual deploy to IIS

(This scenario is only supported on Windows because it requires MSDeploy)

Similar to Azure Web App, the website can also deploy to an on-premise IIS with [iisnode](https://github.com/tjanczuk/iisnode) and [Node.js](https://nodejs.org/) installed.

[iisnode](https://github.com/tjanczuk/iisnode) helps manage Node.js worker process:

* Automatic process recycle
* Redirect console output to file

After you have packed your website into a MSDeploy ZIP file (`npm run pack`), use [MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy) to "sync" the package to the server. For example,

```
"C:\Program Files (x86)\IIS\Microsoft Web Deploy V3\msdeploy.exe"
  -verb:sync
  -source:package="dist\packages\web.zip"
  -dest:
    auto,
    ComputerName="https://<server>:443/msdeploy.axd?site=<appname>",
    UserName='<username>',
    Password='<password>',
    AuthType='Basic'
  -setParam:name="IIS Web Application Name",value="<appname>"
```

(Whitespace and line breaks added for clarity)

## Work in progress

These are items we are working on or under consideration:

* [x] ~~Add [pngout](http://www.advsys.net/ken/utils.htm) to `npm run build`~~
* [x] ~~Continuous deployment on Azure Web Apps~~
  * [x] ~~`npm install` should build~~
  * [x] ~~`.deployment` file for Kudu to specify project folder at `dist/iisapp/`~~
* [ ] Scaffold with [Yeoman](http://yeoman.io/)
* [x] ~~Use a single `package.json` if possible~~
* [ ] Host development server programmatically
* [x] ~~Bundle using [rollup.js](http://rollupjs.org/)~~
  * [ ] Find a better plugin or way to bundle LESS into `bundle.js`
* [ ] Uglify production `bundle.js`