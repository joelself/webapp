'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var getSession = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(key) {
        var session;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!sessions.has(key)) {
                            sessions.set(key, { session: { nodes: new Map(), edges: new Map() }, maxAge: maximumAge });
                        }
                        session = sessions.get(key).session;
                        return _context.abrupt('return', new Promise(function (resolve) {
                            resolve(session);
                        }));

                    case 3:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getSession(_x) {
        return _ref.apply(this, arguments);
    };
}();

var setSession = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(key, sess, maxAge) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        sessions.set(key, { session: sess, maxAge: maxAge });
                        setTimeout(function () {
                            sessions.delete(key);
                        }, maxAge);
                        return _context2.abrupt('return', new Promise(function (resolve) {
                            resolve();
                        }));

                    case 3:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function setSession(_x2, _x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

var destroySession = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(key) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        sessions.delete(key);
                        return _context3.abrupt('return', new Promise(function (resolve) {
                            resolve();
                        }));

                    case 2:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function destroySession(_x5) {
        return _ref3.apply(this, arguments);
    };
}();

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _www = require('./www');

var _www2 = _interopRequireDefault(_www);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _koaBodyparser = require('koa-bodyparser');

var _koaBodyparser2 = _interopRequireDefault(_koaBodyparser);

var _kcors = require('kcors');

var _kcors2 = _interopRequireDefault(_kcors);

var _koaHbs = require('koa-hbs');

var _koaHbs2 = _interopRequireDefault(_koaHbs);

var _koaSession = require('koa-session');

var _koaSession2 = _interopRequireDefault(_koaSession);

var _koaWebsocket = require('koa-websocket');

var _koaWebsocket2 = _interopRequireDefault(_koaWebsocket);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _updater = require('./updater');

var _updater2 = _interopRequireDefault(_updater);

var _swagger = require('swagger2');

var swagger = _interopRequireWildcard(_swagger);

var _swagger2Koa = require('swagger2-koa');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var sessions = new Map();
var maximumAge = 86400000;
var CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    store: { get: getSession, set: setSession, destroy: destroySession },
    maxAge: maximumAge,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: false /** (boolean) signed or not (default true) */
};
var document = swagger.loadDocumentSync("./swagger.yaml");

if (!swagger.validateDocument(document)) {
    throw Error("./swagger.yaml does not conform to the Swagger 2.0 schema");
}


var broadcaster = (0, _koaWebsocket2.default)(new _koa2.default(), { clientTracking: true });

broadcaster.ws.use((0, _koaSession2.default)(CONFIG, broadcaster));
broadcaster.ws.use(function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(ctx, next) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        ctx.state.neo4j = _config2.default.neo4j;
                        ctx.state.server = broadcaster.ws.server;
                        _context4.next = 4;
                        return next();

                    case 4:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    }));

    return function (_x6, _x7) {
        return _ref4.apply(this, arguments);
    };
}()).use((0, _koaBodyparser2.default)()).use(_api2.default.routes()).use(_api2.default.allowedMethods()).use((0, _swagger2Koa.validate)(document));

var webpage = new _koa2.default();

webpage.use(_koaHbs2.default.middleware({
    viewPath: __dirname + '/views'
})).use((0, _koaBodyparser2.default)()).use(_www2.default.routes()).use(_www2.default.allowedMethods()).use((0, _swagger2Koa.ui)(document, "/swagger"));

var updaterApp = (0, _koaWebsocket2.default)(new _koa2.default());
updaterApp.ws.use(function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(ctx, next) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        ctx.state.neo4j = _config2.default.neo4j;
                        ctx.state.server = broadcaster.ws.server;
                        _context5.next = 4;
                        return next();

                    case 4:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, undefined);
    }));

    return function (_x8, _x9) {
        return _ref5.apply(this, arguments);
    };
}()).use(_updater2.default.routes()).use(_updater2.default.allowedMethods());

exports.default = { webpage: webpage, broadcaster: broadcaster, updater: updaterApp };