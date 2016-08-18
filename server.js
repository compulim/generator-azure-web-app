'use strict';

require('./dist/iisapp/server')(process.env.PORT)
  .then(
    port => {
      console.info(`Server now listening to port ${ port }`);
    },
    err => {
      console.error(`Failed to start server due to ${ err.message }`);

      return Promise.reject(err);
    });