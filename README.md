# generator-azure-web-app

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

Generates a minimalist Web App with [React](https://facebook.github.io/react/), [Webpack](https://webpack.github.io/), [rollup.js](http://rollupjs.org/), [Express](https://expressjs.com/), and [Gulp](http://gulpjs.com/).

You can deploy the Web App to a vanilla Node.js, [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/), or IIS.

## Introduction

Modern websites are not just bunches of plain text files. Build process increases page load efficiency and overall page performance. This process involves:

* Concatenating multiple JavaScript files into a single file (a.k.a. bundling)
* Obfuscate and minify JavaScript files
* Re-compress JPEG and PNG files for better compression ratio
* Remove dead code or code that is only used in development mode

We use [Webpack](https://webpack.github.io/) and [rollup.js](http://rollupjs.org/) as a bundler for our build process. And the directory structure is designed to be able to host as a standalone Node.js server or IIS on [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/) and [Azure VM](https://azure.microsoft.com/en-us/services/virtual-machines/).

Notes: we recently moved to rollup.js for bundling in production mode, and Webpack development server in development mode. `Rollup.js` has better tree-shaking algorithm and less clunky source code.

## Try it out in 3 easy steps

1. Fork this repository
2. Click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)
3. Commit your changes and see it continuously deploy to Azure

It takes about 5-10 minutes to build for the first time (due to large npm install), have a little patience.

## How to develop professionally

There are few steps to develop using our `azure-web-app` scaffolding:

1. Create a new Web App project
2. Run development server and develop locally
3. Build the project for production deployment
4. Deploy to target servers
    1. Deploy as a vanilla Node.js
    2. Deploy to Azure Web App
    3. Deploy to IIS, on-premise or cloud

### Create a new Web App Project

For the very first time, install [Yeoman](https://yeoman.io/) and our generator, `npm install -g yo generator-azure-web-app`.

Then, use Yeoman to create a new project, `yo azure-web-app`.

### Run development server and develop locally

Run `npm run host`, the development server will listen to port 80 and available at [http://localhost/](http://localhost/) with [hot module replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html).

Start developing on the server, you can:

1. Edit JavaScript at [`web/src/`](web/src/)
    1. Code are transpiled by [Babel](https://babeljs.io/) with [ES2015](https://npmjs.com/package/babel-preset-es2015) and [React](https://npmjs.com/package/babel-preset-react)
    2. To import packages, mark them as development dependencies, for example, `npm install redux --save-dev`
2. Edit static files at [`web/files/`](web/files/), including
    1. Image assets, thru [`gulp-imagemin`](https://npmjs.com/package/gulp-imagemin)
    2. HTML files, thru [`gulp-htmlmin`](https://npmjs.com/package/gulp-htmlmin)
3. Add new API at [`src/controllers/api.js`](src/controllers/api.js)
    1. To import packages, mark them as direct dependencies, for example, `npm install serve-static --save`
    2. Don't forget to restart the development server to pick up your new code

### Build the project for production deployment

Before deploying to the server, you will need to build the JavaScript bundle, minify images, etc. Type `npm run build`.

> Instead of Webpack, we use rollup.js as bundler because it has a better tree-shaking mechanism, thus smaller output file size.

### Deploy to target servers

The project support hybrid deployment models:

* Standalone Node.js
* Azure App Service
    * Thru continuous deployment
    * Thru MSDeploy
* IIS

#### Deploy as a standalone Node.js

To run as a standalone Node.js server, go under `dist/website/`, then run `node app.js`.

> The directory `dist/website/` contains everything that need to run the production server, including minified HTML files and assets. It can be copied to production server to run.

> For load-balancing and scalability, it is recommended to use a process lifecycle manager to manage the server process. For example, [PM2](https://www.npmjs.com/package/pm2).

#### Deploy to Azure App Service

Azure App Service support continuous deployment or traditional MSDeploy. We recommend continuous deployment for most projects.

##### Thru continuous deployment

You can deploy with GitHub, local Git, Dropbox, or OneDrive. In this example, we will deploy it thru GitHub.

1. Commit your project as a GitHub repository
2. Browse your repository on GitHub
3. In the [`README.md`](README.md), click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

As you push new commits to GitHub, Azure Web App will pick them up and deploy the project immediately.

> When deploying using Continuous Deployment, the project will be built on Azure, instead of locally. We prepared a [custom deployment script](https://github.com/projectkudu/kudu/wiki/Custom-Deployment-Script) at [deploy.cmd](deploy.cmd)

##### Thru MSDeploy

Deploying thru MSDeploy is uncommon, but it is required when you prefer CI/CD using other tools, e.g. [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx).

1. Pack the deployment as a ZIP file, run `npm run pack`
2. Download publish settings file from [Azure Dashboard](https://portal.azure.com/) or using [Azure PowerShell](https://msdn.microsoft.com/en-us/library/dn385850(v=nav.70).aspx)
  * Modify iisnode configuration to select correct Node.js version
    * Add a line to [`iisnode.yml`](iisnode.yml): `nodeProcessCommandLine: "D:\Program Files (x86)\nodejs\6.6.0\node.exe"`
3. Deploy the ZIP file, run `npm run deploy --publishsettings=yoursite.PublishSettings`

> When deployed thru MSDeploy, [`iisnode.yml`](iisnode.yml) is not updated by Project Kudu automatically, thus you will need to modify [`iisnode.yml`](iisnode.yml) to manually select Node.js version.
>
> We have overrode some defaults in [`iisnode.yml`](iisnode.yml):
>
> * `debuggingEnabled` is set to `false`
> * `devErrorsEnabled` is set to `false`
> * `loggingEnabled` is set to `false`
> * `nodeProcessCountPerApplication` is set to `0`
>   * One worker process per CPU
> * `node_env` is set to `production`
>   * We assume hosting the site in IIS is always in production mode
>   * Express is faster when environment variable `NODE_ENV` is set to `production`, details [here](http://apmblog.dynatrace.com/2015/07/22/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/)

#### Deploy to IIS

You can also deploy Web App project to an on-premise or hosted IIS.

1. Make sure [Node.js](https://nodejs.org/) and [iisnode](https://github.com/tjanczuk/iisnode) is installed
2. Pack the deployment as a ZIP file, run `npm run pack`
3. Use MSDeploy to [deploy your package](https://msdn.microsoft.com/en-us/library/dd465337(v=vs.110).aspx)

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

## Advanced topics

This section helps you to dig deeper into the project.

### Important files and directories

| Filename | Description |
|----------------|-------------|
| `dist/` | Build output |
| `dist/website/` | Compiled web server ready to run by itself or hosted on IIS |
| `dist/website/public/` | Bundled content and static assets |
| `dist/packages/web.zip` | Web server packed by MSDeploy and ready to deploy to Azure Web Apps |
| [`src/app.js`](src/app.js) | Depends on `NODE_ENV`, development mode serves content directly from [`web`](web/), production mode serves content from `dist/website/public` |
| [`src/controllers/api.js`](src/controllers/api.js) | RESTful API hosted at [http://localhost/api](http://localhost/api) |
| [`src/iisnode.yml`](src/iisnode.yml) | [iisnode configuration](https://tomasz.janczuk.org/2012/05/yaml-configuration-support-in-iisnode.html) |
| [`src/web.config`](src/web.config) | `Web.config` for hosting under Azure Web App and IIS |
| [`scripts/`](scripts) | Gulpfile for building and packing the project |
| [`web/files/`](web/files) | Asset source files |
| [`web/src/`](web/src) | JavaScript source files |

### NPM scripts

To help building the project, there are several NPM scripts.

| Task name     | Description |
| ------------- | ----------- |
| `build`       | Start the build process |
| `deploy`      | Deploy the website to Azure Web App |
| `host:dev`    | Host a Webpack development server and bundle on-the-fly |
| `host:prod`   | Host a production server using pre-bundled files at `dist/website/` |
| `pack`        | Use MSDeploy to pack everything at `dist/website/` into `dist/packages/web.zip` |

### Building the website

To build the website, run `npm run build`. The build output will be located at `dist/website/`.

* Specify build favor by either
    * Set environment variable `NODE_ENV` to `production`, or
    * Run `npm run build -- --build production`
* Specify bundler by either
    * Set environment variable `BUNDLER` to `rollup` or `webpack`, or
    * Run `npm run build -- --bundler rollup`

> Currently, the build favor (either `development` or `production`) is only used by [`transform-node-env-inline`](https://babeljs.io/docs/plugins/transform-node-env-inline/). It helps reducing bundle size by excluding developer-friendly error messages in production build.

#### What the build do

Source code can be found at [`scripts/build.js`](scripts/build.js).

* Copy server code from [`src/`](src) to `dist/website/`, exclude `node_modules` folder
  * After copy complete, will run `npm install --ignore-scripts --only=production` to install fresh packages
* Bundle source files from [`web/src/`](web/src) to `dist/website/public/dist/bundle.js`
  * Will use existing npm packages from `web/node_modules`
* Copy static assets from [`web/files/`](web/files) to `dist/website/public/`
  * Will minify image with [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin/)
  * Will minify HTML with [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin/)

### Webpack configuration

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

### Webpack development mode configuration

When running Webpack development server, additional configurations are required, for example, hot module replacement.

When running under development server, we will add the following to [`webpack.config.js`](web/webpack.config.js):

* Serve assets from [`web/files/`](web/files/)
* Enable [source map](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-tools)
  * Use absolute path for source map for compatibility with Edge
* Also write a copy of `bundle.js` to `dist/webpack/bundle.js` for debugging purpose
* Hot module replacement
  * Support React component with [`react-hot`](https://github.com/gaearon/react-hot-loader) loader

### Rollup.js configuration

Rollup.js bundler is used only in production build.

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

### Enable source map output in production mode

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

## Work in progress

These are items we are working on or under consideration:

* [x] ~~Add [pngout](http://www.advsys.net/ken/utils.htm) to `npm run build`~~
* [x] ~~Continuous deployment on Azure Web Apps~~
  * [x] ~~`npm install` should build~~
  * [x] ~~`.deployment` file for Kudu to specify project folder at `dist/website/`~~
* [x] ~~Scaffold with [Yeoman](http://yeoman.io/)~~
* [x] ~~Use a single `package.json` if possible~~
* [x] ~~Host development server programmatically~~
* [x] ~~Bundle using [rollup.js](http://rollupjs.org/)~~
  * [ ] Find a better plugin or way to bundle LESS into `bundle.js`
* [ ] Uglify production `bundle.js`