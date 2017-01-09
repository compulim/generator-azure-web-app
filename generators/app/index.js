'use strict';

const askName   = require('inquirer-npm-name');
const path      = require('path');
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  initializing() {
    this.props = {};
  }

  paths() {
    this.sourceRoot(path.join(__dirname, '../../'));
  }

  prompting() {
    return askName({
      name: 'name',
      message: 'Your website name',
      default: 'web-example'
    }, this).then(props => {
      this.props.name = props.name;

      this.destinationRoot(path.join(this.props.name, '/'));
    });
  }

  writing() {
    this.fs.copy(
      this.templatePath('**/*'),
      this.destinationPath(),
      {
        globOptions: {
          ignore: [
            '**/package.json',
            '**/dist/**/*',
            '**/generators/**/*',
            '**/node_modules/**/*'
          ]
        }
      }
    );

    const generatorPackageJSON = this.fs.readJSON(this.templatePath('package.json'));
    const packageJSON = this.fs.readJSON(this.destinationPath('package.json'), {
      description: generatorPackageJSON.description,
      engines: {
        node: '^6.6.0'
      },
      main: 'src/app.js',
      private: true,
      version: generatorPackageJSON.version
    });

    packageJSON.name = this.props.name;

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
