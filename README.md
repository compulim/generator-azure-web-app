# webpack-template

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

Website template with [React](https://facebook.github.io/react/), [Webpack](https://webpack.github.io/), [hot module replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html), and [Express](https://expressjs.com/). [MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy) to prepare deployment for [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/).

## Introduction

Modern websites are not bunches of plain text files. Build process increases page load efficiency and overall page performance. This process involves:

* Concatenating multiple JavaScript files into a single file (a.k.a. bundling)
* Obfuscate and minify JavaScript files
* Re-compress JPEG and PNG files for better compression ratio
* Remove dead code or code that is only used in development mode

We use Webpack as a bundler for our build process. And the folder structure is designed to be able to host under IIS on [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/).

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
  * Create new HTML file at [`/web/public/`](web/public)
  * Save assets to [`/web/public/`](web/public)
* JavaScript code
  * Create new JavaScript file at [`/web/src/`](web/src)
  * To import packages, mark them as development dependencies, for example, `npm install react --save-dev`

#### Adding new API endpoints

Add new API endpoints at [`/prodserver/controllers/api.js`](prodserver/controllers/api.js).

To import packages, mark them as production dependencies, for example, `npm install serve-static --save`.

Lastly, restart the development server to pick up your new code.

### Production run

#### Build the project first

Always build the project first by running `npm run build`. This will output the build to `/dist/iisapp/`.

Then, there are few options to host the server:

* Host with Node.js
* Host with Azure Web App
  * Continuous integration: deploy via GitHub
  * Controlled release: deploy using MSDeploy
* Host with IIS

##### Host with Node.js

Under `/dist/iisapp/`, run `server.js`.

The directory `/dist/iisapp/` contains everything that need to run the production server, including minified HTML files and assets.

For load-balancing and scalability, it is recommended to use a process lifecycle manager to manage the server process. For example, [PM2](https://www.npmjs.com/package/pm2).

##### Host with Azure Web App

There are two options to host on Azure Web App:

* Deploy via Github (Recommended)
  * As you push new commits to GitHub, your Azure Web App will pick them up and deploy immediately
  * Click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/) to start
* Deploy using MSDeploy
  * For manual or controlled release (for example, [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx))
  * Download publish settings file from [Azure Dashboard](https://portal.azure.com/) or using [Azure PowerShell](https://msdn.microsoft.com/en-us/library/dn385850(v=nav.70).aspx).
  * Then, run `npm run pack`
  * Then, run `npm run deploy --publishsettings=yoursite.PublishSettings`

##### Host with IIS

Run `npm run pack`. This will build a MSDeploy ZIP file at `/dist/packages/web.zip`.

Then using MSDeploy, manually deploy `/dist/packages/web.zip` to your IIS.

## Important files and directories

| Filename | Description |
|----------------|-------------|
| [`devserver/`](devserver) | Webpack development server, serve content from [`web/public/`](web/public) and [`web/src/`](web/src) |
| `dist/` | Build output |
| `dist/iisapp/` | Compiled web server ready to run by itself or hosted on IIS |
| `dist/iisapp/public/` | Bundled content and static assets |
| `dist/packages/web.zip` | Web server packed by MSDeploy and ready to deploy to Azure Web Apps |
| [`prodserver/`](prodserver) | Express production server, serve content from `dist/iisapp/public` |
| [`prodserver/controllers/api.js`](prodserver/controllers/api.js) | RESTful API for [http://localhost/api](http://localhost/api) |
| [`prodserver/web.config`](prodserver/web.config) | `Web.config` for hosting under IIS with [iisnode](https://github.com/tjanczuk/iisnode) |
| [`scripts/`](scripts) | Gulpfile for building and packing the project |
| [`web/public/`](web/public) | Asset source files |
| [`web/src/`](web/src) | JavaScript source files |

## Gulpfile scripts

There are multiple NPM scripts help building the project.

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

## Advanced: Hosting

There are three ways to host your project:

* Webpack development server
  * Bundle on-the-fly, shorter build time
  * Support [hot module replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html) (supersede [LiveReload](http://livereload.com/))
  * Local host only, not recommended to serve over network
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

#### File serving order

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

#### File serving order

* `*` if matching file exists, will be served from `dist/iisapp/public/*`
  * Also serve bundle `dist/bundle.js` from `dist/iisapp/public/dist/bundle.js`
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
  * To support multiple Node.js versions on Azure Web App

#### File serving order

This will largely same as hosting with standalone Express server. Except when serving `*`, files will be served directly by IIS and not passing thru iisnode or Express. This helps increase performance by serving and caching static files with [kernel-mode driver](https://technet.microsoft.com/en-us/library/cc740087(v=ws.10).aspx) (http.sys).

## Advanced: Packing for Azure Web App

(This command is only supported on Windows because it requires [MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy))

To pack the content and production server, `npm run pack`.

It will create a MSDeploy ZIP file that can be deployed to any IIS server, including [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/). This ZIP file contains Express production server and website contents.

Additional parameters added to MSDeploy ZIP file:

| name                     | defaultValue       | tags     | kind           | scope    |
|--------------------------|--------------------|----------|---------------|----------|
| IIS Web Application Name | `Default Web Site` | `IisApp` | `ProviderPath` | `IisApp` |

Before packing the project, make sure your current build is up-to-date, run `npm run build`.

MSDeploy can be installed using [Web Platform Installer](https://www.microsoft.com/web/downloads/platform.aspx).

## Advanced: Deployment

There are few ways for deployment:

* Manual deploy to any Node.js capable server
  * Simply copy `dist/iisapp` folder to your server and run `server.js`
* Continuous deployment to Azure Web App
  * Recommended for agile teams
* Manual deploy to Azure Web App
  * Recommended for projects that requires release management
* Manual deploy to IIS

### Continuous deployment for Azure Web App

This project can be deployed to [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/) using continuous deployment with GitHub. Azure Web App is powered by [Project Kudu](https://github.com/projectkudu/kudu).

To deploy to Azure, please click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/), or refer to this [article](https://azure.microsoft.com/en-us/documentation/articles/app-service-continous-deployment/).

To run Webpack on Azure, we prepared a [custom deployment script](https://github.com/projectkudu/kudu/wiki/Custom-Deployment-Script) (a.k.a. `deploy.cmd`).

* Copy source files to temporary folder (under `D:\local\Temp\`)
* Build the project (by running `npm install`)
* Copy server and bundles from `D:\local\Temp\...\dist\iisapp\` to `D:\home\site\wwwroot\`

### Manual deploy to Azure Web App

(This command is only supported on Windows because it requires MSDeploy)

First, pack the web server, `npm run pack`. This will output a MSDeploy package file at `/dist/packages/web.zip`.

Then, deploy the package file to Azure Web App, `npm run deploy -- --publishsettings=<yoursettings>.PublishSettings`.

The publish settings file can be downloaded from [Azure Dashboard](https://portal.azure.com/) or using [Azure PowerShell](https://msdn.microsoft.com/en-us/library/dn385850(v=nav.70).aspx).

Although this command is only supported on Windows, you can deploy the project by continuous deployment from GitHub and other popular repositories.

### Manual deploy to IIS

First, pack the web server, `npm run pack`.

Then, use [MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy) to "sync" the package to the server. For example,

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

(whitespace added for clarity)

## Work in progress

These are items we are working on or under consideration:

* [x] ~~Add [pngout](http://www.advsys.net/ken/utils.htm) to `npm run build`~~
* [x] ~~Continuous deployment on Azure Web Apps~~
  * [x] ~~`npm install` should build~~
  * [x] ~~`.deployment` file for Kudu to specify project folder at `dist/iisapp/`~~
* [ ] Scaffold with [Yeoman](http://yeoman.io/)
* [x] ~~Use a single `package.json` if possible~~
* [ ] Host development server programmatically
