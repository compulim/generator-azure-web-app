# generator-azure-web-app

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

Minimalist Web App generator: [Webpack](https://webpack.github.io/)/[Rollup](https://rollupjs.org/) + [React](https://facebook.github.io/react/) + [Express](https://expressjs.com/), deployable to vanilla [Node.js](https://nodejs.org/), [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/), and IIS

## Introduction

Modern websites are not just bunches of plain text files. Build process increases page load efficiency and overall page performance. This process involves:

* Concatenating multiple JavaScript files into a single file (a.k.a. bundling)
* Obfuscate and minify JavaScript files
* Re-compress JPEG and PNG files for better compression ratio
* Remove dead code or code that is only used in development mode

> We recently moved to rollup.js for bundling in production mode, and Webpack development server in development mode. Rollup.js has better tree-shaking algorithm and less clunky source code.

## Try it out in 3 easy steps

1. Fork this repository
2. Click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)
3. Commit your changes and see it continuously deploy to Azure

It takes about 5-10 minutes to build for the first time, have a little patience.

## How to develop professionally

There are few steps to develop using our `azure-web-app` scaffolding:

1. Create a new Web App project
2. Run development server and develop locally
3. Build the project for production deployment
4. Deploy to target servers
  * As a vanilla Node.js
  * To Azure Web App
  * To IIS, on-premise or cloud

### Create a new Web App Project

For the very first time, install [Yeoman](https://yeoman.io/) and our generator, `npm install -g yo generator-azure-web-app`.

Then, use [Yeoman](https://yeoman.io/) to create a new project, `yo azure-web-app`.

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