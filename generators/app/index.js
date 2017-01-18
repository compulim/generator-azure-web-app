'use strict';

const askName   = require('inquirer-npm-name');
const { join }  = require('path');
const Generator = require('yeoman-generator');

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
    ['*.js', '*.md', 'iisnode.yml', 'web.config'].forEach(filename => {
      this.fs.copy(
        this.templatePath(filename),
        this.destinationPath()
      );
    });

    ['lib', 'scripts', 'web'].forEach(filename => {
      this.fs.copy(
        this.templatePath(filename),
        this.destinationPath(filename)
      );
    });

    this.fs.write(this.destinationPath('.gitignore'), ['dist', '**/node_modules', 'npm*.log*'].join('\n'));

    const generatorPackageJSON = this.fs.readJSON(this.templatePath('package.json'));
    const packageJSON = this.fs.readJSON(this.destinationPath('package.json'), {
      description: generatorPackageJSON.description,
      engines: {
        node: '^6.6.0'
      },
      main: 'app.js',
      private: true,
      version: generatorPackageJSON.version
    });

    packageJSON.name = this.props.name;
    packageJSON.license = 'UNLICENSED';
    packageJSON.private = true;

    delete packageJSON.author;
    delete packageJSON.bugs;
    delete packageJSON.homepage;
    delete packageJSON.preferGlobal;
    delete packageJSON.repository;
    delete packageJSON.files;
    delete packageJSON.keywords;

    // Do not copy Yeoman-only dependencies
    delete generatorPackageJSON.dependencies['inquirer-npm-name'];
    delete generatorPackageJSON.dependencies['yeoman-generator'];

    ['dependencies', 'devDependencies', 'scripts'].forEach(name => {
      packageJSON[name] = Object.assign({}, generatorPackageJSON[name], packageJSON[name] || {});
    });

    this.fs.writeJSON(this.destinationPath('package.json'), packageJSON);
  }

  install() {
    this.npmInstall([], { 'ignore-scripts': true });
  }
};
