# generator-azure-web-app

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

Minimalist Azure Web App generator: [Webpack](https://webpack.github.io/)/[Rollup](https://rollupjs.org/) + [React](https://facebook.github.io/react/) + [Express](https://expressjs.com/), deployable to standalone [Node.js](https://nodejs.org/), [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/web/), and IIS.

# Why us?

Modern websites are not just bunches of plain text files. Build process increases page load efficiency and overall page performance.

But everyone build and promote their own build process. There are few reasons you should choose us:

* Scaffold with [Yeoman](https://yeoman.io/), `yo azure-web-app`
* For greater flexibility, we only include [React](https://facebook.github.io/react/)
* Bundle with the *best* bundler
  * [Webpack](https://webpack.github.io/) for development, hot module replacement means less page refresh
  * [Rollup](https://rollupjs.org/) for production, better tree-shaking algorithm means smaller file size
* Hybrid deployment
  * Standalone Node.js
  * [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/web/)
  * On-premise or hosted IIS

# Try it out in 3 easy steps

1. Fork [this repository](https://github.com/candrholdings/generator-azure-web-app/)
2. Click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)
3. Push your changes and see it continuously deploy to Azure

> It takes about 5-10 minutes to build for the first time, have a little patience.

# How to develop professionally

1. Create a new Web App project
2. Run development server and develop locally
3. Build for production deployment
4. Deploy to target servers
  * As a vanilla Node.js
  * To Azure Web App
  * To IIS, on-premise or cloud

## Create a new Web App Project

For the very first time, install [Yeoman](https://yeoman.io/) and our generator, `npm install -g yo generator-azure-web-app`.

Subsequently, run `yo azure-web-app` to create a new project with [Yeoman](https://yeoman.io/).

## Run development server and develop locally

Run `npm start`, the development server will listen to port 80 and available at [http://localhost/](http://localhost/).

> To change the port to 8080, either set environment variable `PORT` to `8080`, or run `npm start -- --port 8080`.

* Edit JavaScript at [`web/src/`](web/src/)
  * Code are transpiled by [Babel](https://babeljs.io/) with [ES2015](https://npmjs.com/package/babel-preset-es2015) and [React](https://npmjs.com/package/babel-preset-react)
  * To import packages, mark them as development dependencies, for example, `npm install redux --save-dev`
* Edit static files at [`web/files/`](web/files/), including
  * Image assets, thru [`gulp-imagemin`](https://npmjs.com/package/gulp-imagemin)
  * HTML files, thru [`gulp-htmlmin`](https://npmjs.com/package/gulp-htmlmin)
* Add new RESTful API at [`src/controllers/api.js`](src/controllers/api.js)
  * To import packages, mark them as direct dependencies, for example, `npm install serve-static --save`

> Don't forget to restart the development server to pick up your new code

## Build the project for production deployment

Before deploying to the server, you will need to build the JavaScript bundle, minify images, etc. Run `npm run build`.

> Instead of Webpack, we use rollup.js as bundler because it has a better tree-shaking mechanism, thus smaller output file size.

> To opt for Webpack for production build, run `npm run build -- --bundler webpack`.

## Deploy to target servers

The project support hybrid deployment models:

* Standalone Node.js
* [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/web/)
  * Thru [continuous deployment](https://azure.microsoft.com/en-us/blog/using-app-service-web-apps-continuous-deployment-with-github-organizations/)
  * Thru MSDeploy
* IIS with [iisnode](https://github.com/tjanczuk/iisnode)

### Deploy as a standalone Node.js

To run as a standalone Node.js server, go under `dist/website/`, then run `node app.js`.

> To deploy to your SaaS provider, copy everything under `dist/website/` to your provider. We recommend [`PM2`](http://pm2.io/) for process management and scalability.

### Deploy to Azure App Service

[Azure App Service](https://azure.microsoft.com/en-us/services/app-service/web/) support [continuous deployment](https://azure.microsoft.com/en-us/blog/using-app-service-web-apps-continuous-deployment-with-github-organizations/) or traditional [MSDeploy](https://azure.microsoft.com/en-us/blog/simple-azure-websites-deployment/). We recommend continuous deployment for most projects.

#### Thru continuous deployment

Azure Web App can automatically update itself when you push/save your code. You can deploy with [GitHub](https://github.com/), local Git, [Dropbox](https://dropbox.com/), or [OneDrive](https://onedrive.com/). In this example, we will deploy it thru GitHub.

1. Commit your project to GitHub
2. Browse to your project on GitHub
3. Click [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

> When deploying using continuous deployment, the project will be built on Azure, instead of locally. We prepared a [custom deployment script](https://github.com/projectkudu/kudu/wiki/Custom-Deployment-Script) at [deploy.cmd](deploy.cmd)

#### Thru MSDeploy

Deploying thru MSDeploy is uncommon, but it is required when you prefer CI/CD using other tools, such as [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx).

1. Pack the deployment as a MSDeploy ZIP file, run `npm run pack`
2. Download publish settings file, either from [Azure Dashboard](https://portal.azure.com/) or using [Azure PowerShell](https://msdn.microsoft.com/en-us/library/dn385850(v=nav.70).aspx)
3. Modify iisnode configuration to select correct Node.js version
  * Add a line to [`iisnode.yml`](iisnode.yml): `nodeProcessCommandLine: "D:\Program Files (x86)\nodejs\6.6.0\node.exe"`
4. Deploy using MSDeploy, run `npm run deploy --publishsettings=yoursite.PublishSettings`

> When deployed thru MSDeploy, [`iisnode.yml`](iisnode.yml) is not updated by Project Kudu automatically, thus you will need to modify [`iisnode.yml`](iisnode.yml) to manually select Node.js version.

### Deploy to IIS

You can also deploy the project to an on-premise or hosted IIS.

1. Make sure [Node.js](https://nodejs.org/) and [iisnode](https://github.com/tjanczuk/iisnode) is installed on the target server
2. Pack the deployment as a MSDeploy ZIP file, run `npm run pack`
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

(Whitespace and line breaks added for clarity)

## Work in progress

These are items we are working on or under consideration:

* [x] ~~Add [pngout](http://www.advsys.net/ken/utils.htm) to `npm run build`~~
* [x] ~~Continuous deployment on Azure App Service~~
  * [x] ~~`npm install` should build~~
  * [x] ~~`.deployment` file for Kudu to specify project folder at `dist/website/`~~
* [x] ~~Scaffold with [Yeoman](http://yeoman.io/)~~
* [x] ~~Use a single `package.json` if possible~~
* [x] ~~Host development server programmatically~~
* [x] ~~Bundle using [rollup.js](http://rollupjs.org/)~~
  * [ ] Find a better plugin or way to bundle LESS into `bundle.js`
* [x] ~~Uglify production `bundle.js`~~
  * [x] ~~Uglify rollup.js build~~
  * [x] ~~Uglify Webpack build~~
* [ ] Steps to deploy from [VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx)
* [ ] Include [Jest](https://facebook.github.io/jest/) and `npm test` script

## Contributions

Like us? [Star](https://github.com/candrholdings/generator-azure-web-app/stargazers) us.

Want to make it better? File an [issue](https://github.com/candrholdings/generator-azure-web-app/issues) to us.
