# Continuous integration and deployment with VSTS

[VSTS Release Management](https://www.visualstudio.com/en-us/features/release-management-vs.aspx) supports two crucial tasks in CI/CD:

* Continuous integration: build artifacts whenever there is a new commit
* Continuous deployment: deploy to server whenever a new artifact is built

By chaining both CI and CD process together, whenever a new commit is done, VSTS will build the bundle and deploy to Azure App Service or host of your choice.

You can also add unit tests to your build, approval process, and fallback, etc.

## Build definition (continuous integration)

Create a new build definition using "NodeJS With Gulp" template. It should have the following tasks preconfigured:

1. npm install (version `0.*`)
   * Leaves all settings as-is
2. Run gulp task (version `0.*`)
   * Set Gulp task to `build`
3. Archive files (version `1.*`)
   * Set root folder to `$(System.DefaultWorkingDirectory)\dist\website`
4. Copy Publish Artifact: drop (version `1.*`)
   * Leaves all settings as-is

> Optionally, you can set this build definition to be triggered whenever there is a commit to the `master` branch.

> Build verification tests can be added to make the artifact is good to deploy.

## Release definition (continuous deployment)

Create a new release definition using "Azure App Service Deployment" template. It should have the following tasks preconfigured:

1. Deploy Azure App Service (version `2.*`)
   * Select your Azure Subscription
   * Select your App Service name
   * Set package to `$(System.DefaultWorkingDirectory)/Build/drop/*.zip`

> You can also set this release definition to be triggered whenever a new artifact is built.

> Performance and integration tests can be added to make sure the deployment is good for public consumption.

## Advanced build and deployment

For a deployment scenario that requires provisioning resource group, linking to virtual networks, etc. We recommend deploying using Azure Resource Manager (ARM) template.

1. Build definition
   1. Run `npm install`
   2. Run Gulp task named `build`
   3. Run Gulp task named `pack`
   4. Publish artifact `/dist/packages/web.zip` to server drop
2. Release definition
   1. Upload publish artifact `web.zip` to Azure Storage
      * Output with SAS token is highly recommended
   2. Run an ARM template that will deploy thru [`MSDeploy` extension](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-web-arm-with-msdeploy-provision)
      * Set `packageUri` to the URL to the uploaded `web.zip`, obtained from last step
      * Set `dbType` to `None`
      * Set `setParameters` to `{ "IIS Web Application Name": <your web app name> }`
