# Continuous integration and deployment with VSTS

[VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx) supports two crucial tasks in CI/CD:

* Continuous integration: build artifacts whenever there is a new commit
* Continuous deployment: deploy to server whenever a new artifact is built

By chaining both CI and CD process together, whenever a new commit is done, VSTS will build the bundle and deploy to Azure App Service or host of your choice.

You can also add unit tests to your build, approval process, and fallback, etc.

## Build definition (continuous integration)

Create a new build definition using "NodeJS With Gulp" template. It should have the following tasks preconfigured:

1. npm install (`0.*`)
   * Leaves all settings as-is
2. Run gulp task (`0.*`)
   * Set Gulp task to `build`
3. Archive files (1.*)
   * Set root folder to `$(System.DefaultWorkingDirectory)\dist\website`
4. Copy Publish Artifact: drop (`1.*`)
   * Leaves all settings as-is

> Optionally, you can set this build definition to be triggered whenever there is a commit to the `master` branch.

> Build verification tests can be added to make the artifact is good to deploy.

## Release definition (continuous deployment)

Create a new release definition using "Azure App Service Deployment" template. It should have the following tasks preconfigured:

1. Deploy Azure App Service (`2.*`)
   * Select your Azure Subscription
   * Select your App Service name
   * Set package to `$(System.DefaultWorkingDirectory)/Build/drop/*.zip`

> You can also set this release definition to be triggered whenever a new artifact is built.

> Performance and integration tests can be added to make sure the deployment is good for public consumption.
