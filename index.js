const port = process.env.PORT || 4000;
const wsPort = process.env.PORT || 9000;
const env = process.env.NODE_ENV || 'development';
const src = env === 'production' ? './build/app' : './src/app';

require('babel-polyfill');
if (env === 'development') {
  // for development use babel/register for faster runtime compilation
  require('babel-register');
}

const apps = require(src).default;
apps.wsApp.listen(wsPort);
apps.app.listen(port);