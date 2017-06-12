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

// const validateCollection = async (ctx, next) => {
//   const { collection } = ctx.params;
//   if (!(collection in ctx.state.collections)) {
//     return ctx.throw(404);
//   }
//   await next();
// }

// const validateKey = async (ctx, next) => {
//   const { authorization } = ctx.request.headers;
//   if (authorization !== ctx.state.authorizationHeader) {
//     return ctx.throw(401);
//   }
//   await next();
// }

api.del('/delete_edge', function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
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

api.get('/add_edge', function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(ctx, next) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            ctx.websocket.on('message', function () {
              var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(message) {
                var json, promises;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        console.log("\nadd_edge");
                        json = JSON.parse(message);
                        _context2.next = 4;
                        return this.ctx.state.neo4j.addEdge(json.source, json.target);

                      case 4:
                        promises = [];

                        this.ctx.state.server.clients.forEach(function (client) {
                          console.log("************************");
                          if (client.readyState === _ws2.default.OPEN) {
                            var promise;
                            console.log("#1 Here");
                            if (client.query.ip) promise = this.ctx.state.neo4j.getByIp(client.session.data, client.query.ip, client.query.depth);else promise = this.ctx.state.neo4j.getByHostname(client.session.data, client.query.hostname, client.query.depth);
                            console.log("#2 Here");
                            promises.push(promise.then(function (data) {
                              console.log("#3 Here");
                              if (data.nodesAdd.length > 0 || data.edgesAdd.length > 0) {
                                client.send(JSON.stringify(data));
                              }
                            }));
                          }
                        }.bind({ ctx: ctx }));
                        _context2.next = 8;
                        return Promise.all(promises);

                      case 8:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, this);
              }));

              return function (_x5) {
                return _ref3.apply(this, arguments);
              };
            }().bind({ ctx: ctx }));

          case 1:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

api.get('/delete_node', function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(ctx, next) {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            ctx.websocket.on('message', function () {
              var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(message) {
                var json, promises;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        console.log("\ndel_edge");
                        json = JSON.parse(message);
                        _context4.next = 4;
                        return this.ctx.state.neo4j.delNode(json.hostname);

                      case 4:
                        promises = [];

                        this.ctx.state.server.clients.forEach(function (client) {
                          console.log("+++ DEL NODE ************************");
                          if (client.readyState === _ws2.default.OPEN) {
                            var promise;
                            console.log("#1 Here");
                            if (client.query.ip) promise = this.ctx.state.neo4j.getByIp(client.session.data, client.query.ip, client.query.depth);else promise = this.ctx.state.neo4j.getByHostname(client.session.data, client.query.hostname, client.query.depth);
                            console.log("#2 Here");
                            promises.push(promise.then(function (data) {
                              console.log("#3 Here");
                              if (data.nodesDel.length > 0 || data.edgesDel.length > 0) {
                                client.send(JSON.stringify(data));
                              }
                            }));
                          }
                        }.bind({ ctx: ctx }));
                        _context4.next = 8;
                        return Promise.all(promises);

                      case 8:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, _callee4, this);
              }));

              return function (_x8) {
                return _ref5.apply(this, arguments);
              };
            }().bind({ ctx: ctx }));

          case 1:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function (_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}());

api.get('/add_node', function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(ctx, next) {
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            console.log("add_node");
            ctx.websocket.on('message', function () {
              var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(message) {
                var json, node;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        console.log(message);
                        json = JSON.parse(message);
                        _context6.next = 4;
                        return this.ctx.state.neo4j.addNode(json.hostname, json.ip);

                      case 4:
                        node = _context6.sent;

                        this.ctx.websocket.send(JSON.stringify(node));

                      case 6:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                }, _callee6, this);
              }));

              return function (_x11) {
                return _ref7.apply(this, arguments);
              };
            }().bind({ ctx: ctx }));

          case 2:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  }));

  return function (_x9, _x10) {
    return _ref6.apply(this, arguments);
  };
}());

// api.post('/hostname/:name/:depth',
//   async (ctx, next) => {
//     const { name, depth } = ctx.params;
//     var key = "name:" + name + "," + depth;
//     ctx.session.data = {key: key, nodes: new Map(), edges: new Map()};
//     ctx.websocket.data = ctx.session.data;
//     const promise = ctx
//       .state
//       .neo4j.getByHostname(ctx.session.data, name, depth);
//     promise.then(function(result) {
//       this.ctx.body = result;
//     }.bind({ctx: ctx}));
//   }
// );

// api.post('/:collection',
//   validateKey,
//   validateCollection,
//   async (ctx, next) => {
//     const { collection } = ctx.params;
//     const count = await ctx
//       .state
//       .collections[collection]
//       .add(ctx.request.body);

//     ctx.status = 201;
//   });

// api.get('/:collection/:attribute/:value/count',
//   validateKey,
//   validateCollection,
//   async (ctx, next) => {
//     const {
//       collection,
//       attribute,
//       value
//     } = ctx.params;

//     const count = await ctx
//       .state
//       .collections[collection]
//       .countBy(attribute, value);

//     ctx.body = {
//       count: count,
//     };
//   });
exports.default = api;