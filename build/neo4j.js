"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var neo4j = require('neo4j-driver').v1;
var uri = "bolt://localhost:7687";
var user = "neo4j";
var password = "password";

var Neo4j = function () {
    function Neo4j(clear) {
        _classCallCheck(this, Neo4j);

        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
        this.session = this.driver.session();

        if (clear) {
            var resultPromise = this.session.run('MATCH (n) DETACH DELETE n');
        }
    }

    _createClass(Neo4j, [{
        key: "addNode",
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(hostname, ip) {
                var promise;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                promise = this.session.run("CREATE (a:Host {hostname:$hostname, ip: $ip}) RETURN {id: ID(a), hostname: a.hostname, ip: a.ip}", { hostname: hostname, ip: ip });
                                return _context.abrupt("return", promise.then(function (result) {
                                    var singleRecord = result.records[0];
                                    var node = singleRecord.get(0);

                                    return { hostname: node.hostname, ip: node.ip, id: node.id.low };
                                }));

                            case 2:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function addNode(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return addNode;
        }()
    }, {
        key: "delNode",
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(hostname) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt("return", this.session.run("MATCH p = (n:Host {hostname: $hostname}) DETACH DELETE n", { hostname: hostname }));

                            case 1:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function delNode(_x3) {
                return _ref2.apply(this, arguments);
            }

            return delNode;
        }()
    }, {
        key: "addEdge",
        value: function () {
            var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(source, target) {
                var promise;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                promise = this.session.run("MATCH (n:Host) WHERE ID(n) = $source MATCH (m:Host) WHERE ID(m) = $target CREATE (n)-[c:CONNECTION]->(m)", { source: neo4j.int(source), target: neo4j.int(target) });
                                return _context3.abrupt("return", promise);

                            case 2:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function addEdge(_x4, _x5) {
                return _ref3.apply(this, arguments);
            }

            return addEdge;
        }()
    }, {
        key: "getByIp",
        value: function () {
            var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(data, addr, depth) {
                var promise;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                promise = this.session.run("MATCH p = (n:Host {ip: $addr})-[c:CONNECTION*1.." + depth + "]-(m) RETURN p", { addr: addr });

                                this.data = data;
                                return _context4.abrupt("return", promise.then(function (result) {
                                    return this.processResult(result, this.data.nodes, this.data.edges);
                                }.bind(this), function (reason) {}));

                            case 3:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function getByIp(_x6, _x7, _x8) {
                return _ref4.apply(this, arguments);
            }

            return getByIp;
        }()
    }, {
        key: "getByHostname",
        value: function () {
            var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(data, name, depth) {
                var promise;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                promise = this.session.run("MATCH p = (n:Host {hostname: $name})-[c:CONNECTION*1.." + depth + "]-(m) RETURN p", { name: name });

                                this.data = data;
                                return _context5.abrupt("return", promise.then(function (result) {
                                    return this.processResult(result, this.data.nodes, this.data.edges);
                                }.bind(this)));

                            case 3:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function getByHostname(_x9, _x10, _x11) {
                return _ref5.apply(this, arguments);
            }

            return getByHostname;
        }()
    }, {
        key: "processResult",
        value: function () {
            var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(result, nodes, edges, timestamp) {
                var nodesNew, edgesNew, nodesAdd, nodesDel, edgesAdd, edgesDel, match, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, key, value, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _step2$value, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _step3$value, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _step4$value, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _step5$value, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _step6$value;

                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                nodesNew = new Map();
                                edgesNew = new Map();
                                nodesAdd = [];
                                nodesDel = [];
                                edgesAdd = [];
                                edgesDel = [];
                                match = null;

                                result.records.forEach(function (element) {
                                    var record = element.get(0);
                                    if (match == null) {
                                        match = {
                                            id: record.start.identity.low,
                                            hostname: record.start.properties.hostname,
                                            ip: record.start.properties.ip
                                        };
                                        nodesNew.set(record.start.identity.low, match);
                                    }
                                    nodesNew.set(record.end.identity.low, {
                                        id: record.end.identity.low,
                                        hostname: record.end.properties.hostname,
                                        ip: record.end.properties.ip
                                    });
                                    record.segments.forEach(function (edge) {
                                        edgesNew.set(edge.relationship.start.low + "," + edge.relationship.end.low, {
                                            source: edge.relationship.start.low,
                                            target: edge.relationship.end.low
                                        });
                                    });
                                });
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context6.prev = 11;
                                for (_iterator = nodesNew.entries()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    _step$value = _slicedToArray(_step.value, 2), key = _step$value[0], value = _step$value[1];

                                    if (!nodes.has(key)) {
                                        nodesAdd.push(value);
                                    }
                                }
                                _context6.next = 19;
                                break;

                            case 15:
                                _context6.prev = 15;
                                _context6.t0 = _context6["catch"](11);
                                _didIteratorError = true;
                                _iteratorError = _context6.t0;

                            case 19:
                                _context6.prev = 19;
                                _context6.prev = 20;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 22:
                                _context6.prev = 22;

                                if (!_didIteratorError) {
                                    _context6.next = 25;
                                    break;
                                }

                                throw _iteratorError;

                            case 25:
                                return _context6.finish(22);

                            case 26:
                                return _context6.finish(19);

                            case 27:
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context6.prev = 30;
                                for (_iterator2 = nodes.entries()[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    _step2$value = _slicedToArray(_step2.value, 2), key = _step2$value[0], value = _step2$value[1];

                                    if (!nodesNew.has(key)) {
                                        nodesDel.push(value);
                                    }
                                }
                                _context6.next = 38;
                                break;

                            case 34:
                                _context6.prev = 34;
                                _context6.t1 = _context6["catch"](30);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context6.t1;

                            case 38:
                                _context6.prev = 38;
                                _context6.prev = 39;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 41:
                                _context6.prev = 41;

                                if (!_didIteratorError2) {
                                    _context6.next = 44;
                                    break;
                                }

                                throw _iteratorError2;

                            case 44:
                                return _context6.finish(41);

                            case 45:
                                return _context6.finish(38);

                            case 46:
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context6.prev = 49;
                                for (_iterator3 = edgesNew.entries()[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    _step3$value = _slicedToArray(_step3.value, 2), key = _step3$value[0], value = _step3$value[1];

                                    if (!edges.has(key)) {
                                        edgesAdd.push(value);
                                    }
                                }
                                _context6.next = 57;
                                break;

                            case 53:
                                _context6.prev = 53;
                                _context6.t2 = _context6["catch"](49);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context6.t2;

                            case 57:
                                _context6.prev = 57;
                                _context6.prev = 58;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 60:
                                _context6.prev = 60;

                                if (!_didIteratorError3) {
                                    _context6.next = 63;
                                    break;
                                }

                                throw _iteratorError3;

                            case 63:
                                return _context6.finish(60);

                            case 64:
                                return _context6.finish(57);

                            case 65:
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context6.prev = 68;
                                for (_iterator4 = edges.entries()[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    _step4$value = _slicedToArray(_step4.value, 2), key = _step4$value[0], value = _step4$value[1];

                                    if (!edgesNew.has(key)) {
                                        edgesDel.push(value);
                                    }
                                }
                                _context6.next = 76;
                                break;

                            case 72:
                                _context6.prev = 72;
                                _context6.t3 = _context6["catch"](68);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context6.t3;

                            case 76:
                                _context6.prev = 76;
                                _context6.prev = 77;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 79:
                                _context6.prev = 79;

                                if (!_didIteratorError4) {
                                    _context6.next = 82;
                                    break;
                                }

                                throw _iteratorError4;

                            case 82:
                                return _context6.finish(79);

                            case 83:
                                return _context6.finish(76);

                            case 84:
                                nodes.clear();
                                edges.clear();
                                _iteratorNormalCompletion5 = true;
                                _didIteratorError5 = false;
                                _iteratorError5 = undefined;
                                _context6.prev = 89;
                                for (_iterator5 = nodesNew.entries()[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    _step5$value = _slicedToArray(_step5.value, 2), key = _step5$value[0], value = _step5$value[1];

                                    nodes.set(key, value);
                                }
                                _context6.next = 97;
                                break;

                            case 93:
                                _context6.prev = 93;
                                _context6.t4 = _context6["catch"](89);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context6.t4;

                            case 97:
                                _context6.prev = 97;
                                _context6.prev = 98;

                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }

                            case 100:
                                _context6.prev = 100;

                                if (!_didIteratorError5) {
                                    _context6.next = 103;
                                    break;
                                }

                                throw _iteratorError5;

                            case 103:
                                return _context6.finish(100);

                            case 104:
                                return _context6.finish(97);

                            case 105:
                                _iteratorNormalCompletion6 = true;
                                _didIteratorError6 = false;
                                _iteratorError6 = undefined;
                                _context6.prev = 108;
                                for (_iterator6 = edgesNew.entries()[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                    _step6$value = _slicedToArray(_step6.value, 2), key = _step6$value[0], value = _step6$value[1];

                                    edges.set(key, value);
                                }
                                _context6.next = 116;
                                break;

                            case 112:
                                _context6.prev = 112;
                                _context6.t5 = _context6["catch"](108);
                                _didIteratorError6 = true;
                                _iteratorError6 = _context6.t5;

                            case 116:
                                _context6.prev = 116;
                                _context6.prev = 117;

                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                    _iterator6.return();
                                }

                            case 119:
                                _context6.prev = 119;

                                if (!_didIteratorError6) {
                                    _context6.next = 122;
                                    break;
                                }

                                throw _iteratorError6;

                            case 122:
                                return _context6.finish(119);

                            case 123:
                                return _context6.finish(116);

                            case 124:
                                return _context6.abrupt("return", { nodesAdd: nodesAdd, nodesDel: nodesDel, edgesAdd: edgesAdd, edgesDel: edgesDel });

                            case 125:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[11, 15, 19, 27], [20,, 22, 26], [30, 34, 38, 46], [39,, 41, 45], [49, 53, 57, 65], [58,, 60, 64], [68, 72, 76, 84], [77,, 79, 83], [89, 93, 97, 105], [98,, 100, 104], [108, 112, 116, 124], [117,, 119, 123]]);
            }));

            function processResult(_x12, _x13, _x14, _x15) {
                return _ref6.apply(this, arguments);
            }

            return processResult;
        }()
    }]);

    return Neo4j;
}();

exports.default = Neo4j;