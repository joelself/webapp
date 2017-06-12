'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var api = (0, _koaRouter2.default)();

api.get('/ip/:addr/:depth', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
    var _ctx$params, addr, depth, key, data;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log("0. received query");
            _ctx$params = ctx.params, addr = _ctx$params.addr, depth = _ctx$params.depth;

            console.log("1. received query: " + addr + ", depth: " + depth);
            key = "addr:" + addr + "," + depth;

            ctx.session.data = { key: key, nodes: new Map(), edges: new Map() };
            ctx.websocket.query = { ip: addr, hostname: null, depth: depth };
            ctx.websocket.session = ctx.session;
            console.log("client count: " + ctx.state.server.clients.length);
            console.log("2. received query: " + addr + ", depth: " + depth);
            _context.next = 11;
            return ctx.state.neo4j.getByIp(ctx.session.data, addr, depth);

          case 11:
            data = _context.sent;

            console.log("6. Here");
            console.log(data);
            ctx.websocket.send(JSON.stringify(data));

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

api.get('/hostname/:name/:depth', function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, next) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            ctx.websocket.on('message', function (message) {
              var _ctx$params2 = ctx.params,
                  name = _ctx$params2.name,
                  depth = _ctx$params2.depth;

              var key = "name:" + name + "," + depth;
              ctx.session.data = { key: key, nodes: new Map(), edges: new Map() };
              ctx.websocket.data = ctx.session.data;
              var promise = ctx.state.neo4j.getByHostname(ctx.session.data, name, depth);
              promise.then(function (result) {
                this.ctx.body = result;
              }.bind({ ctx: ctx }));
            });

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

exports.default = api;