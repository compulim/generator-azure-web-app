'use strict';

const
  config = require('./config'),
  ChildProcess = require('child_process'),
  fs = require('fs'),
  gutil = require('gulp-util'),
  os = require('os'),
  Promise = require('bluebird');

const
  exec = Promise.promisify(ChildProcess.exec),
  parseXml = Promise.promisify(require('xml2js').parseString),
  readFile = Promise.promisify(fs.readFile),
  stat = Promise.promisify(fs.stat);

module.exports = function (gulp) {
  gulp.task('deploy', deploy);

  function deploy() {
    if (os.platform() !== 'win32') {
      return Promise.reject(new Error('MSDeploy is only supported on Windows platform'));
    }

    if (!config.DEPLOY_PUBLISH_SETTINGS) {
      return Promise.reject(new Error('must specific *.PublishSettings file'));
    }

    return stat(config.IISAPP_PACKAGE_PATH)
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

        return exec(
          [
            `"${ config.MSDEPLOY_BIN_PATH }"`,
            `-verb:sync`,
            `-source:package=${ config.IISAPP_PACKAGE_PATH }`,
            `-dest:auto,${ formatIISParams(destParams) }`,
            `-setParam:name="IIS Web Application Name",value="${ profile.$.msdeploySite }"`
          ].join(' '), {
            maxBuffer: 10485760
          }
        );
      });
  }
};

function formatIISParams(map) {
  return Object.keys(map).reduce((parts, name) => {
    parts.push(`${ name }='${ map[name] }'`);

    return parts;
  }, []).join(',');
}
