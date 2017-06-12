'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var api = (0, _koaRouter2.default)();

api.get('/add_edge', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, next) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        ctx.websocket.on('message', function () {
                            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(message) {
                                var json, promises;
                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                json = JSON.parse(message);
                                                _context.next = 3;
                                                return this.ctx.state.neo4j.addEdge(json.source, json.target);

                                            case 3:
                                                promises = [];

                                                this.ctx.state.server.clients.forEach(function (client) {
                                                    if (client.readyState === _ws2.default.OPEN) {
                                                        var promise;
                                                        if (client.query.ip) promise = this.ctx.state.neo4j.getByIp(client.session.data, client.query.ip, client.query.depth);else promise = this.ctx.state.neo4j.getByHostname(client.session.data, client.query.hostname, client.query.depth);
                                                        promises.push(promise.then(function (data) {
                                                            if (data.nodesAdd.length > 0 || data.edgesAdd.length > 0) {
                                                                client.send(JSON.stringify(data));
                                                            }
                                                        }));
                                                    }
                                                }.bind({ ctx: ctx }));
                                                _context.next = 7;
                                                return Promise.all(promises);

                                            case 7:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, this);
                            }));

                            return function (_x3) {
                                return _ref2.apply(this, arguments);
                            };
                        }().bind({ ctx: ctx }));

                    case 1:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

api.get('/delete_node', function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(ctx, next) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        ctx.websocket.on('message', function () {
                            var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(message) {
                                var json, promises;
                                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                    while (1) {
                                        switch (_context3.prev = _context3.next) {
                                            case 0:
                                                json = JSON.parse(message);
                                                _context3.next = 3;
                                                return this.ctx.state.neo4j.delNode(json.hostname);

                                            case 3:
                                                promises = [];

                                                this.ctx.state.server.clients.forEach(function (client) {
                                                    if (client.readyState === _ws2.default.OPEN) {
                                                        var promise;
                                                        if (client.query.ip) promise = this.ctx.state.neo4j.getByIp(client.session.data, client.query.ip, client.query.depth);else promise = this.ctx.state.neo4j.getByHostname(client.session.data, client.query.hostname, client.query.depth);
                                                        promises.push(promise.then(function (data) {
                                                            if (data.nodesDel.length > 0 || data.edgesDel.length > 0) {
                                                                client.send(JSON.stringify(data));
                                                            }
                                                        }));
                                                    }
                                                }.bind({ ctx: ctx }));
                                                _context3.next = 7;
                                                return Promise.all(promises);

                                            case 7:
                                            case 'end':
                                                return _context3.stop();
                                        }
                                    }
                                }, _callee3, this);
                            }));

                            return function (_x6) {
                                return _ref4.apply(this, arguments);
                            };
                        }().bind({ ctx: ctx }));

                    case 1:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    }));

    return function (_x4, _x5) {
        return _ref3.apply(this, arguments);
    };
}());

api.get('/add_node', function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(ctx, next) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        ctx.websocket.on('message', function () {
                            var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(message) {
                                var json, node;
                                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                                    while (1) {
                                        switch (_context5.prev = _context5.next) {
                                            case 0:
                                                json = JSON.parse(message);
                                                _context5.next = 3;
                                                return this.ctx.state.neo4j.addNode(json.hostname, json.ip);

                                            case 3:
                                                node = _context5.sent;

                                                this.ctx.websocket.send(JSON.stringify(node));

                                            case 5:
                                            case 'end':
                                                return _context5.stop();
                                        }
                                    }
                                }, _callee5, this);
                            }));

                            return function (_x9) {
                                return _ref6.apply(this, arguments);
                            };
                        }().bind({ ctx: ctx }));

                    case 1:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, undefined);
    }));

    return function (_x7, _x8) {
        return _ref5.apply(this, arguments);
    };
}());

exports.default = api;