'use strict';

const config       = require('../config');
const ChildProcess = require('child_process');
const fs           = require('fs');
const os           = require('os');
const Promise      = require('bluebird');

const { magenta }                  = require('colors');
const { formatIISParameters, log } = require('./util');

const exec     = Promise.promisify(ChildProcess.exec);
const parseXml = Promise.promisify(require('xml2js').parseString);
const readFile = Promise.promisify(fs.readFile);
const stat     = Promise.promisify(fs.stat);

module.exports = function (gulp) {
  gulp.task('deploy', deploy);

  function deploy() {
    if (os.platform() !== 'win32') {
      return Promise.reject(new Error('MSDeploy is only supported on Windows platform'));
    }

    if (!config.DEPLOY_PUBLISH_SETTINGS) {
      return Promise.reject(new Error('must specific *.PublishSettings file'));
    }

    return stat(config.DEST_PACKAGE_FILE)
      .then(() => readFile(config.DEPLOY_PUBLISH_SETTINGS))
      .then(publishSettings => parseXml(publishSettings))
      .then(publishSettings => {
        const profiles = publishSettings.publishData.publishProfile;

        const profile = profiles.find(profile => {
          return profile.$.publishMethod === 'MSDeploy';
        });

        if (!profile) {
          return Promise.reject(new Error('cannot find publish profile with publishMethod = "MSDeploy"'));
        }

        const destParams = {
          AuthType: 'Basic',
          ComputerName: `https://${ profile.$.publishUrl }/msdeploy.axd?site=${ profile.$.msdeploySite }`,
          UserName: profile.$.userName,
          Password: profile.$.userPWD
        };

        const setParams = {
          name: config.MSDEPLOY_IIS_PARAMETERS.name,
          value: profile.$.msdeploySite
        };

        log('deploy', `Deploying to ${ magenta(profile.$.publishUrl) }`);

        return exec(
          [
            `"${ config.MSDEPLOY_BIN_FILE }"`,
            `-verb:sync`,
            `-source:package=${ config.DEST_PACKAGE_FILE }`,
            `-dest:auto,${ formatIISParameters(destParams) }`,
            `-setParam:${ formatIISParameters(setParams) }`
          ].join(' '), {
            maxBuffer: 10485760
          }
        );
      });
  }
};
