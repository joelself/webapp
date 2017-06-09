const webpagePort = process.env.PORT || 4000;
const broadcasterPort = process.env.BROAD_PORT || 9000;
const updaterPort = process.env.UPDATE_PORT || 9001;
const env = process.env.NODE_ENV || 'development';
const src = env === 'production' ? './build/app' : './src/app';

require('babel-polyfill');
if (env === 'development') {
  // for development use babel/register for faster runtime compilation
  require('babel-register');
}

const apps = require(src).default;
apps.broadcaster.listen(broadcasterPort);
apps.webpage.listen(webpagePort);
apps.updater.listen(updaterPort);