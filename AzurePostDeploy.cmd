@ECHO ON
SETLOCAL
PUSHD "%~dp0"
SET DEPLOY

npm install
gulp build

COPY app.js dist\website\
COPY iisnode.yml dist\website\
COPY web.config dist\website\

POPD
ENDLOCAL