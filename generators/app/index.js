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
      name: 'name',
      message: 'Your Web App name',
      default: 'webapp-example'
    }, this).then(props => {
      this.props.name = props.name;

      this.destinationRoot(join(this.props.name, '/'));
    });
  }

  writing() {
    ['*.js', '*.md'].forEach(filename => {
      this.fs.copy(
        this.templatePath(filename),
        this.destinationPath()
      );
    });

    ['azuredeploy.json', 'iisnode.yml', 'web.config', 'lib', 'scripts', 'web'].forEach(filename => {
      this.fs.copy(
        this.templatePath(filename),
        this.destinationPath(filename)
      );
    });

    this.fs.write(this.destinationPath('.gitignore'), ['dist', '**/node_modules', 'npm*.log*', '*.PublishSettings'].join('\n'));

    const generatorPackageJSON = this.fs.readJSON(this.templatePath('package.json'));
    const overridePackageJSON = this.fs.readJSON(this.templatePath('generators/app/overridePackage.json'));
    const packageJSON = merge(generatorPackageJSON, overridePackageJSON);

    packageJSON.description = packageJSON.description
      .replace(/\$\{\s*packageName\s*\}/g, generatorPackageJSON.name)
      .replace(/\$\{\s*version\s*\}/g, generatorPackageJSON.version);

    packageJSON.name = this.props.name;

    this.fs.writeJSON(this.destinationPath('package.json'), packageJSON);
  }

  install() {
    this.npmInstall([], { 'ignore-scripts': true });
  }
};
