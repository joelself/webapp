'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _neo4j = require('./neo4j');

var _neo4j2 = _interopRequireDefault(_neo4j);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    neo4j: new _neo4j2.default(true),
    cors: require('../config/cors')
};