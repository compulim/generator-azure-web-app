# Roadblocks

It is not an easy task to build a scaffolding that support lots of deployment scenarios.

Here we list out the roadblocks we hit and the decision we made:

* Failed effort on deploying to App Service for Linux
* Failed effort on unifying `package.json`
* Failed effort on enabling hot module replacement for IE8

## Roadblock on [App Service for Linux](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-linux-intro)

Because we cannot modify virtual path on Linux, thus, continous deployment is currently not supported on Linux. We will continue evaluate the possibility to CI/CD on Linux.

One possible solution is to re-architect the project so the output is in-place rather than under `/dist`. But downsides:

* Difficult to package the website as MSDeploy ZIP file

## Roadblock on unifying `package.json`

Originally, we planned to have a single `package.json` and packages for server code are marked as *direct dependencies* and browser code are marked as *development dependencies*. But few things:

* We want to separate list of server-only packages
  * This helps minimize the final output file size, i.e. no Webpack or Babel in server-only packages
* But the problem is, Azure Web App deployment script (a.k.a. `deploy.cmd`) will run `npm install --production` only
  * We don't want to customize deployment script and maintain versions of `deploy.cmd`
  * We need to build browser code and we need to run `npm install --only=development` on `postinstall`
  * Thus, we need to use `--ignore-scripts` to hack
  * Also, it doesn't quite make sense for `npm install --production` to install both production and development packages
  * `--ignore-scripts` broke some packages, e.g. `optipng-bin`

Thus, we decided to have two `package.json`, one in [root](package.json) for browser code (e.g. Babel + React), another in [`lib`](lib/packages.json) for server code.

## Roadblock on enabling hot module replacement on Internet Explorer 8

We tried very hard to bring hot module replacement to IE8 but it deemed impossible. We learnt a few things though:

* For [`react`](https://npmjs.com/packages/react) and [`react-dom`](https://npmjs.com/packages/react-dom), use `^0.14` instead of `>=15.0` because React discontinued IE8 support in `15.0`
* Because we prefer CDN version of React to reduce the size of `bundle.js`, we need to add [`es5-shim`](https://github.com/es-shims/es5-shim) and [`es5-sham`](https://github.com/es-shims/es5-shim), and optionally, [`console-polyfill`](https://github.com/paulmillr/console-polyfill)
* [UglifyJS](https://github.com/mishoo/UglifyJS) will break IE8 unless `{ "screw_ie8": false }` in `compress`, `mangle`, and `output` section
  * (TBC) Even we set `screw_ie8` in `mangle`, sometimes, mangle will still break IE8
* JavaScript files under `node_modules/**/*.js` might use reserved keywords, e.g. `default`, `catch`, etc
  * [`webpack/hot/only-dev-server.js`](https://github.com/webpack/webpack/blob/master/hot/only-dev-server.js) refer to `Promise.catch()` which need to be escaped as `Promise['catch']()`
  * We need to use Babel with the following plugins:
    * [`transform-es3-member-expression-literals`](https://npmjs.com/packages/transform-es3-member-expression-literals)
    * [`transform-es3-property-literals`](https://npmjs.com/packages/transform-es3-property-literals)
    * Optionally, [`transform-node-env-inline`](https://npmjs.com/packages/transform-node-env-inline), for downsizing the codebase
* Getter/setter were used by [`webpack/lib/HotModuleReplacement.runtime.js`](https://github.com/webpack/webpack/blob/master/lib/HotModuleReplacement.runtime.js)
  * We guess HMR use getter/setter intensively to keep the internal state of the object away from the object, so the object can be easily replaced without resetting the internal state
  * Getter/setter are not supported in IE8 and Babel

## Roadblock on putting app.js inside /lib

We originally, put `app.js` under `/lib/`.

* `iisnode` consumes the `iisnode.yml` at the same directory level of the entrypoint as specified by `package.json/scripts.start`, thus, at `/lib/iisnode.yml`
* But Project Kudu will only update `/iisnode.yml` at the project root

Thus, if we put `app.js` under `/lib/`, the `iisnode.yml` updated by Project Kudu will not be consumed by iisnode.

### Workaround

We put a thin entrypoint at `/index.js` and it points to `/lib/app.js`.