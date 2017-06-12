"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _koaRouter = require("koa-router");

var _koaRouter2 = _interopRequireDefault(_koaRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var api = (0, _koaRouter2.default)();

api.get("/ip/:addr/:depth", function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
        var _ctx$params, addr, depth, key, data;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _ctx$params = ctx.params, addr = _ctx$params.addr, depth = _ctx$params.depth;
                        key = "addr:" + addr + "," + depth;

                        ctx.session.data = { key: key, nodes: new Map(), edges: new Map() };
                        ctx.websocket.query = { ip: addr, hostname: null, depth: depth };
                        ctx.websocket.session = ctx.session;
                        _context.next = 7;
                        return ctx.state.neo4j.getByIp(ctx.session.data, addr, depth);

                    case 7:
                        data = _context.sent;

                        ctx.websocket.send(JSON.stringify(data));

                    case 9:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

api.get("/hostname/:name/:depth", function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, next) {
        var _ctx$params2, name, depth, key, data;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _ctx$params2 = ctx.params, name = _ctx$params2.name, depth = _ctx$params2.depth;
                        key = "name:" + name + "," + depth;

                        ctx.session.data = { key: key, nodes: new Map(), edges: new Map() };
                        ctx.websocket.query = { ip: null, hostname: name, depth: depth };
                        ctx.websocket.session = ctx.session;
                        _context2.next = 7;
                        return ctx.state.neo4j.getByHostname(ctx.session.data, name, depth);

                    case 7:
                        data = _context2.sent;

                        ctx.websocket.send(JSON.stringify(data));

                    case 9:
                    case "end":
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