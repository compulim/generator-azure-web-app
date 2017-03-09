[![Azure Web App](doc/azureWebAppLogo.png)](https://azure.microsoft.com/en-us/services/app-service/web/) [![Yeoman](doc/yeomanLogo.png)](https://yeoman.io)

# generator-azure-web-app

[![npm version](https://badge.fury.io/js/generator-azure-web-app.svg)](https://npmjs.com/package/generator-azure-web-app) [![Node.js dependencies](https://david-dm.org/compulim/generator-azure-web-app.svg)](https://david-dm.org/compulim/generator-azure-web-app) [![npm downloads](https://img.shields.io/npm/dm/generator-azure-web-app.svg)](https://npmjs.com/package/generator-azure-web-app)

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

Minimalist Azure Web App generator: [Webpack](https://webpack.github.io/)/[Rollup](https://rollupjs.org/) + [React](https://facebook.github.io/react/) + [Express](https://expressjs.com/), deployable to standalone [Node.js](https://nodejs.org/), [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/web/), and IIS.

# Why us?

Modern websites are not just bunches of plain text files. Build process increases page load efficiency and overall page performance.

But everyone build and promote their own build process. There are few reasons you should choose us:

* Scaffold with [Yeoman](https://yeoman.io/), `yo azure-web-app`
* Choose your own faith: we only include [React](https://facebook.github.io/react/)
* Bundle with the *best* bundler
  * [Webpack](https://webpack.github.io/) for development, hot module replacement means less page refresh
  * Optionally, [Rollup](https://rollupjs.org/) for production, better tree-shaking algorithm means smaller file size
* Support multiple deployment scenarios
  * Standalone Node.js
  * [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/)
    * Thru [continuous deployment](https://azure.microsoft.com/en-us/blog/using-app-service-web-apps-continuous-deployment-with-github-organizations/)
    * Thru [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx)
    * Thru [MSDeploy](https://azure.microsoft.com/en-us/blog/simple-azure-websites-deployment/)
  * On-premise or hosted IIS

# Try it out in 3 easy steps

1. Fork [this repository](https://github.com/compulim/generator-azure-web-app/)
2. Click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)
3. Push your changes and see it continuously deploy to Azure

> It takes about 5-10 minutes for the first build, have a little patience.

# How to develop professionally

1. Create a new Web App project
2. Run local development server
3. Develop locally
4. Prepare for production deployment
5. Deploy to target servers
   * Standalone Node.js
   * [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/web/)
   * On-premise or hosted IIS
6. Update the scaffolding

## Create a new Web App Project

> For the very first time, run `npm install -g yo generator-azure-web-app` to install [Yeoman](https://yeoman.io/) and our scaffold.

Run `yo azure-web-app` to create a new project.

## Run local development server

Run `npm start`, the development server will listen to port 80 and available at [http://localhost/](http://localhost/).

> To change the port to 8080, either set environment variable `PORT` to `8080`, or run `npm start -- --port 8080`.

## Develop locally

* Browser side
  * JavaScript files at [`public/lib/`](public/lib/)
    * Transpiled by [Babel](https://babeljs.io/) with [ES2015](https://npmjs.com/package/babel-preset-es2015) and [React](https://npmjs.com/package/babel-preset-react)
    * Packages should be saved to root [`package.json`](package.json) as *direct dependencies*, for example, `npm install redux --save`
  * Other files at [`public/files/`](public/files/)
    * [`gulp-imagemin`](https://npmjs.com/package/gulp-imagemin) will minify image assets (`*.gif`, `*.jpg`, `*.png`, `*.svg`)
    * [`gulp-htmlmin`](https://npmjs.com/package/gulp-htmlmin) will minify HTML files (`*.html`, and `*.htm`)
* Server side
  * Add new REST API at [`lib/controllers/api.js`](lib/controllers/api.js)
    * Packages should be saved to [`lib/package.json`](lib/package.json) as *direct dependencies*, for example, `cd lib && npm install mongodb --save`

> If you added new packages or modified server code, don't forget to restart the development server to pick up new changes.

## Prepare for production deployment

Run `npm run build`, to bundle JavaScript files, crush images, etc. It outputs to `dist/website/`.

> Instead of [Webpack](https://webpack.github.io/) used in development, you can opt for [Rollup](https://rollupjs.org/) as bundler for production, it has better tree-shaking mechanism, thus smaller output file size.

There are few ways to select your bundler:

* Run `npm run build -- --bundler rollup` for one-time switch
* Set environment variable `NPM_CONFIG_BUNDLER` to `rollup` or `webpack`
* Modify [`.npmrc`](.npmrc) and set `bundler = "rollup"`
* During Yeoman scaffolding, set bundler to `rollup`

## Deployment

The project supports multiple deployment scenarios, we will cover each separately.

* Standalone Node.js
* [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/web/)
  * Thru [continuous deployment](https://azure.microsoft.com/en-us/blog/using-app-service-web-apps-continuous-deployment-with-github-organizations/)
  * Thru [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx)
  * Thru [MSDeploy](https://azure.microsoft.com/en-us/blog/simple-azure-websites-deployment/)
* IIS with [iisnode](https://github.com/tjanczuk/iisnode)

> Don't forget to build your project before deployment, run `npm run build`.

### Deploy as a standalone Node.js

Run `node dist/website/app.js` to run as a standalone Node.js.

> To deploy to your SaaS provider, copy everything under `dist/website/` to your provider.

### Deploy to Azure App Service

[Azure App Service](https://azure.microsoft.com/en-us/services/app-service/web/) support [continuous deployment](https://azure.microsoft.com/en-us/blog/using-app-service-web-apps-continuous-deployment-with-github-organizations/) or traditional [MSDeploy](https://azure.microsoft.com/en-us/blog/simple-azure-websites-deployment/). For small teams, we recommend continuous deployment.

#### Thru continuous deployment

Azure Web App comes with handy [continuous deployment](https://azure.microsoft.com/en-us/blog/using-app-service-web-apps-continuous-deployment-with-github-organizations/) feature. When you push/save your code, Azure Web App will pickup new changes from [GitHub](https://github.com/), local Git (hosted on Azure), [Dropbox](https://dropbox.com/), [OneDrive](https://onedrive.com/), etc.

Follow steps below for first time setup for GitHub deployment.

1. Commit your project to GitHub
2. Browse on GitHub
3. Click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

> When deploying using continuous deployment, the project will build on Azure via [Project Kudu](https://github.com/projectkudu/kudu).

> Because the build is done on Azure, we modified the virtual path from `/site/wwwroot` to `/site/wwwroot/dist/website`. This is done by customizing [`azuredeploy.json`](azuredeploy.json).

#### Thru Visual Studio Team Services

Deploy thru Azure [continuous deployment](https://azure.microsoft.com/en-us/blog/using-app-service-web-apps-continuous-deployment-with-github-organizations/) is limited and asynchronous. This makes the option not ideal for medium or large teams.

We recommend [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx) for advanced deployment, it also comes with [BVTs](https://en.wikipedia.org/wiki/Build_verification_test), performance tests, approval process, rollback, etc.

You can follow steps for VSTS [here](doc/VSTS.md) for advanced deployment scenario.

#### Thru MSDeploy

If you use CI/CD tools other than Azure and VSTS, you may want to integrate with [MSDeploy](https://azure.microsoft.com/en-us/blog/simple-azure-websites-deployment/).

1. Run `npm run build` to build the project
2. Run `npm run pack` to pack the deployment as a MSDeploy ZIP file
3. Download publish settings file, either from [Azure Dashboard](https://portal.azure.com/) or using [Azure PowerShell](https://msdn.microsoft.com/en-us/library/dn385850(v=nav.70).aspx)
4. Run `npm run deploy --publish-settings=yoursite.PublishSettings` to deploy with MSDeploy

> To use a specific version of Node.js, don't forget to modify [`iisnode.yml`](iisnode.yml) manually.

### Deploy to IIS

You can also deploy the project to an on-premise or hosted IIS.

1. Make sure [Node.js](https://nodejs.org/) and [iisnode](https://github.com/tjanczuk/iisnode) is installed on the target server
2. Run `npm run pack` to pack the deployment as a MSDeploy ZIP file
3. Use MSDeploy to [deploy your package](https://msdn.microsoft.com/en-us/library/dd465337(v=vs.110).aspx)

The following MSDeploy command-line switches can be used to deploy the package to an IIS box.

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

## Update the scaffold

We update our scaffold from time to time. To update your existing project:

1. `npm install generator-azure-web-app` to update to latest version of scaffold
2. `yo azure-web-app` to update the scaffold

> Don't worry, Yeoman will prompt to overwrite a file if it should be replaced.

# Roadmap

These are items we are working on or under consideration:

* [x] ~~Add [pngout](http://www.advsys.net/ken/utils.htm) to `npm run build`~~
* [x] ~~Continuous deployment on Azure App Service~~
  * [x] ~~`npm install` should build~~
  * [x] ~~`.deployment` file for Kudu to specify project folder at `dist/website/`~~
* [x] ~~Scaffold with [Yeoman](http://yeoman.io/)~~
* [x] ~~Use a single `package.json` if possible~~
* [x] ~~Host development server programmatically~~
* [x] ~~Bundle using [Rollup](http://rollupjs.org/)~~
* [x] ~~Uglify production `bundle.js`~~
  * [x] ~~Uglify Rollup build~~
  * [x] ~~Uglify Webpack build~~
* [x] Steps to deploy from [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx)
* [x] ~~Try out on [App Service for Linux](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-linux-intro)~~
* [ ] Include [Jest](https://facebook.github.io/jest/) and `npm test` script
* [ ] Consider [glamor](https://npmjs.com/package/glamor) for CSS bundling
* [ ] Consider [restify](https://restify.com) in addition to [Express](https://expressjs.com)

## Roadblock on [App Service for Linux](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-linux-intro)

Because we cannot modify virtual path on Linux, thus, continous deployment is currently not supported on Linux. We will continue evaluate the possibility to CI/CD on Linux.

One possible solution is to re-architect the project so the output is in-place rather than under `/dist`. But downsides:

* Difficult to package the website as MSDeploy ZIP file

## Roadblock on unifying `package.json`

Originally, we planned to have a single `package.json` and packages for server code are marked as *direct dependencies* and browser code are marked as *development dependencies*. But few things:

* We want to separate list of server-only packages
  * This helps minimize the final output file size, i.e. no Webpack or Babel in server-only packages
* Azure Web App deployment script (a.k.a. `deploy.cmd`) will run `npm install --production` only
  * We don't want to customize deployment script and maintain versions of `deploy.cmd`
  * We need to build browser code and we need to run `npm install --only=development` on `postinstall`
  * Thus, we need to use `--ignore-scripts` to hack
  * Also, it doesn't quite make sense for `npm install --production` to install both production and development packages
  * `--ignore-scripts` broke some packages, e.g. `optipng-bin`

Thus, we decided to have two `package.json`, one in [root](package.json) for browser code (e.g. Babel + React), another in [`lib`](lib/packages.json) for server code.

# FAQs

1. After deploying to Azure Web App, it say directory browsing is not allowed.
   * During first deployment, do not browse to the web site until the deployment is ready. Otherwise, it will show 404, until you restart the server.

# Contributions

Like us? [Star](https://github.com/compulim/generator-azure-web-app/stargazers) us.

Want to make it better? File an [issue](https://github.com/compulim/generator-azure-web-app/issues) to us.
