'use strict';

const askName   = require('inquirer-npm-name');
const { join }  = require('path');
const Generator = require('yeoman-generator');
const { merge } = require('./utils');

module.exports = class extends Generator {
  initializing() {
    this.props = {};
  }

  paths() {
    this.sourceRoot(join(__dirname, '../../'));
  }

  prompting() {
    return askName({
      name   : 'name',
      message: 'Your Web App name',
      default: 'webapp-example'
    }, this).then(nameAnswers => {
      return this.prompt([{
        name   : 'enableStickySession',
        message: '(Azure Web App) Enable sticky session',
        default: true,
        type   : 'confirm'
      }, {
        name   : 'use64BitWorkerProcess',
        message: '(Azure Web App) Enable 64-bit worker process',
        default: false,
        type   : 'confirm'
      }, {
        name   : 'bundler',
        message: 'Use Webpack or rollup.js as production bundler',
        default: 'webpack',
        type   : 'list',
        choices: [{
          name : 'Webpack',
          value: 'webpack'
        }, {
          name : 'Rollup (Experimental)',
          value: 'rollup'
        }]
      }, {
        name   : 'dockerfile',
        message: '(Docker) Generate Dockerfile',
        default: null,
        type   : 'list',
        choices: [{
          name : `Don't generate any Dockerfile`,
          value: null
        }, {
          name : 'Official Node.js',
          value: 'node'
        }, {
          name : 'Official Node.js (Alpine Linux)',
          value: 'alpine'
        }, {
          name : 'Windows Server 2016 Nano Server with bare Node.js',
          value: 'nanoserver'
        }, {
          name : 'Windows Server 2016 Server Core with Node.js and iisnode',
          value: 'iisnode'
        }]
      }]).then(otherAnswers => {
        this.props.bundler               = otherAnswers.bundler;
        this.props.dockerfile            = otherAnswers.dockerfile;
        this.props.enableStickySession   = otherAnswers.enableStickySession;
        this.props.name                  = nameAnswers.name;
        this.props.use64BitWorkerProcess = otherAnswers.use64BitWorkerProcess;

        this.destinationRoot(join(this.props.name, '/'));
      })
    });
  }

  writing() {
    ['*.js', '*.md'].forEach(filename => {
      this.fs.copy(
        this.templatePath(filename),
        this.destinationPath()
      );
    });

    ['.dockerignore', 'iisnode.yml', 'web.config', 'doc', 'public', 'scripts'].forEach(filename => {
      this.fs.copy(
        this.templatePath(filename),
        this.destinationPath(filename)
      );
    });

    this.fs.copy(
      this.templatePath('lib'),
      this.destinationPath('lib'),
      {
        globOptions: {
          ignore: '**/node_modules/**'
        }
      }
    );

    this.props.dockerfile && this.fs.copy(
      this.templatePath(`generators/app/Dockerfile.${ this.props.dockerfile }`),
      this.destinationPath('Dockerfile')
    );

    const azureDeployJSON = this.fs.readJSON(this.templatePath('azuredeploy.json'));

    const siteResource = azureDeployJSON.resources.find(resource => resource.type === 'Microsoft.Web/sites');

    siteResource.properties.clientAffinityEnabled = this.props.enableStickySession;

    siteResource.resources
      .find(resource => resource.type === 'config' && resource.name === 'web')
      .properties.use32BitWorkerProcess = !this.props.use64BitWorkerProcess;

    siteResource.resources
      .find(resource => resource.type === 'config' && resource.name === 'appsettings')
      .properties.NPM_CONFIG_BUNDLER = this.props.bundler;

    this.fs.writeJSON(
      this.destinationPath('azuredeploy.json'),
      azureDeployJSON
    );

    this.fs.write(
      this.destinationPath('.npmrc'),
      `bundler = "${ this.props.bundler }"`
    );

    this.fs.write(this.destinationPath('.gitignore'), ['dist', '**/node_modules', 'npm*.log*', '*.PublishSettings'].join('\n'));

    const generatorPackageJSON = this.fs.readJSON(this.templatePath('package.json'));
    const rootPackageJSON = this.fs.readJSON(this.templatePath('generators/app/overridePackage.json'));

    rootPackageJSON.dependencies = merge(
      generatorPackageJSON.dependencies,
      rootPackageJSON.dependencies
    );

    rootPackageJSON.scripts = merge(
      generatorPackageJSON.scripts,
      rootPackageJSON.scripts
    );

    rootPackageJSON.description = rootPackageJSON.description
      .replace(/\$\{\s*packageName\s*\}/g, generatorPackageJSON.name)
      .replace(/\$\{\s*version\s*\}/g, generatorPackageJSON.version);

    rootPackageJSON.name = this.props.name;

    this.fs.writeJSON(this.destinationPath('package.json'), rootPackageJSON);

    const libPackageJSON = this.fs.readJSON(this.templatePath('lib/package.json'));

    libPackageJSON.description = rootPackageJSON.description;
    libPackageJSON.name = `${ this.props.name }-server`;

    this.fs.writeJSON(this.destinationPath('lib/package.json'), libPackageJSON);
  }

  install() {
    this.npmInstall([]);
  }
};
