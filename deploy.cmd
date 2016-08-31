@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 1.0.8
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED DEPLOYMENT_INTERMEDIATE (
  SET DEPLOYMENT_INTERMEDIATE=!DEPLOYMENT_TARGET!\..\intermediate

  IF NOT EXIST "!DEPLOYMENT_INTERMEDIATE!" (
    SET CLEAN_LOCAL_DEPLOYMENT_TEMP=true
  )
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
)

IF NOT DEFINED DEPLOYMENT_TEMP (
  SET DEPLOYMENT_TEMP=%temp%\___deployTemp%random%
  SET CLEAN_LOCAL_DEPLOYMENT_TEMP=true
)

IF DEFINED CLEAN_LOCAL_DEPLOYMENT_TEMP (
  IF EXIST "%DEPLOYMENT_TEMP%" rd /s /q "%DEPLOYMENT_TEMP%"
  mkdir "%DEPLOYMENT_TEMP%"

  IF EXIST "%DEPLOYMENT_INTERMEDIATE%" rd /s /q "%DEPLOYMENT_INTERMEDIATE%"
  mkdir "%DEPLOYMENT_INTERMEDIATE%"
)

IF NOT DEFINED NODE_EXE SET NODE_EXE=node
IF NOT DEFINED NPM_CMD SET NPM_CMD=npm

goto Deployment

:: Utility Functions
:: -----------------

:SelectNodeVersion

IF DEFINED KUDU_SELECT_NODE_VERSION_CMD (
  :: The following are done only on Windows Azure Websites environment
  call %KUDU_SELECT_NODE_VERSION_CMD% "%DEPLOYMENT_SOURCE%" "%DEPLOYMENT_TARGET%" "%DEPLOYMENT_TEMP%"
  IF !ERRORLEVEL! NEQ 0 goto error

  IF EXIST "%DEPLOYMENT_TEMP%\__nodeVersion.tmp" (
    SET /p NODE_EXE=<"%DEPLOYMENT_TEMP%\__nodeVersion.tmp"
    IF !ERRORLEVEL! NEQ 0 goto error
  )

  IF EXIST "%DEPLOYMENT_TEMP%\__npmVersion.tmp" (
    SET /p NPM_JS_PATH=<"%DEPLOYMENT_TEMP%\__npmVersion.tmp"
    IF !ERRORLEVEL! NEQ 0 goto error
  )

  IF NOT DEFINED NODE_EXE (
    SET NODE_EXE=node
  )

  SET NPM_CMD="!NODE_EXE!" "!NPM_JS_PATH!"
) ELSE (
  SET NPM_CMD=npm
  SET NODE_EXE=node
)

goto :EOF

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------

:Deployment
echo Handling node.js deployment.

ECHO ARTIFACTS=%ARTIFACTS%
ECHO DEPLOYMENT_TEMP=%DEPLOYMENT_TEMP%
ECHO CLEAN_LOCAL_DEPLOYMENT_TEMP=%CLEAN_LOCAL_DEPLOYMENT_TEMP%
ECHO KUDU_SYNC_CMD=%KUDU_SYNC_CMD%
ECHO DEPLOYMENT_SOURCE=%DEPLOYMENT_SOURCE%
ECHO DEPLOYMENT_INTERMEDIATE=%DEPLOYMENT_INTERMEDIATE%
ECHO DEPLOYMENT_TARGET=%DEPLOYMENT_TARGET%
ECHO NEXT_MANIFEST_PATH=%NEXT_MANIFEST_PATH%
ECHO PREVIOUS_MANIFEST_PATH=%PREVIOUS_MANIFEST_PATH%

:: 1. KuduSync source files to intermediate folder
call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_SOURCE%" -t "%DEPLOYMENT_INTERMEDIATE%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd;.vscode"
IF !ERRORLEVEL! NEQ 0 goto error

:: 2. Install npm packages
:: BUG: Currently, we must use Node.js < 6.0.0 to run Webpack, otherwise, memory-fs will fail
pushd "%DEPLOYMENT_INTERMEDIATE%"

call :ExecuteCmd !NPM_CMD! install --quiet --ignore-scripts
IF !ERRORLEVEL! NEQ 0 goto error

call :ExecuteCmd !NPM_CMD! dedupe
IF !ERRORLEVEL! NEQ 0 goto error

call :ExecuteCmd !NPM_CMD! run rebuild
IF !ERRORLEVEL! NEQ 0 goto error

popd

:: 3. KuduSync from intermediate folder to target folder
call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_INTERMEDIATE%\dist\iisapp" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%-intermediate" -p "%PREVIOUS_MANIFEST_PATH%-intermediate" -i ".git;.hg;.deployment;deploy.cmd"
IF !ERRORLEVEL! NEQ 0 goto error

:: 4. Select node version
call :SelectNodeVersion

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.
