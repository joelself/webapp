var spawn = require("child_process").spawn;

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

var proc = spawn("node", ["../neo4j-pop/index.js"]);
proc.stdout.on('data', function (data) {
    var str = data.toString()
    var lines = str.split(/(\r?\n)/g);
    for(var i = 0; i < lines.length; i++) {
      lines[i] = "(+}>\t" + lines[i];
    }
    console.log(lines.join(""));
});
proc.stderr.on('data', function (data) {
    var str = data.toString()
    var lines = str.split(/(\r?\n)/g);
    for(var i = 0; i < lines.length; i++) {
      lines[i] = "[E]>\t" + lines[i];
    }
    console.log(lines.join(""));
});
process.on('exit', exitHandler);
function exitHandler(options, err) {
    proc.kill();
}