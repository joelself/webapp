var proxyquire =  require("proxyquire")
  , assert     =  require("assert")
  , neo4jdriverStub = {};

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

var nodes = [];
var edges = [];
var query;
var params;
chai.use(chaiAsPromised);
chai.should();
describe("neo4j", function() {
    before(function(done) {
        nodes = [];
        edges = [];
        var Neo4j = require("../src/neo4j").default;
        var promises = [];
        var db = new Neo4j(true);
        promises.push(db.addNode("abc.com", "192.0.0.1").then(storeNode));
        promises.push(db.addNode("xyz.com", "192.0.0.2").then(storeNode));
        promises.push(db.addNode("123.com", "192.0.0.3").then(storeNode));
        promises.push(db.addNode("789.com", "192.0.0.4").then(storeNode));
        Promise.all(promises).then(result => {
                var promises = [];
                promises.push(db.addEdge(nodes[0].id, nodes[1].id));
                promises.push(db.addEdge(nodes[0].id, nodes[2].id));
                promises.push(db.addEdge(nodes[1].id, nodes[2].id));
                Promise.all(promises).then(result => {
                    done();
                });
        });
    });
    describe("#addNode()", function() {
        it("should return the host object", function() {
            var Neo4j = require("../src/neo4j").default;
            var db = new Neo4j(false);
            var result = db.addNode("foo.com", "10.0.0.1");
            result.should.eventually.have.property("hostname").that.equals("foo.com");
            result.should.eventually.have.property("ip").that.equals("10.0.0.1");
        });
    });
    describe("#getByIp()", function() {
        it("should return the correct set of nodes and edges for the query", function(done) {
            var Neo4j = require("../src/neo4j").default;
            var db = new Neo4j(false);
            db.getByIp({nodes: new Map(), edges: new Map()}, "192.0.0.1", 2).then(result => {
                assert.deepEqual(result, {
                    nodesAdd: 
                        [
                            { id: nodes[0].id, hostname: "abc.com", ip: "192.0.0.1" },
                            { id: nodes[1].id, hostname: "xyz.com", ip: "192.0.0.2" },
                            { id: nodes[2].id, hostname: "123.com", ip: "192.0.0.3" }
                        ],
                    nodesDel: [],
                    edgesAdd: 
                        [
                            { source: nodes[0].id, target: nodes[1].id },
                            { source: nodes[1].id, target: nodes[2].id },
                            { source: nodes[0].id, target: nodes[2].id }
                        ],
                    edgesDel: []
                });
                done();
            });
        });
    });
    describe("#getByHostname()", function() {
        it("should return the correct set of nodes and edges for the query", function(done) {
            var Neo4j = require("../src/neo4j").default;
            var db = new Neo4j(false);
            db.getByHostname({nodes: new Map(), edges: new Map()}, "abc.com", 2).then(result => {
                assert.deepEqual(result, {
                    nodesAdd: 
                        [
                            { id: nodes[0].id, hostname: "abc.com", ip: "192.0.0.1" },
                            { id: nodes[1].id, hostname: "xyz.com", ip: "192.0.0.2" },
                            { id: nodes[2].id, hostname: "123.com", ip: "192.0.0.3" }
                        ],
                    nodesDel: [],
                    edgesAdd: 
                        [
                            { source: nodes[0].id, target: nodes[1].id },
                            { source: nodes[1].id, target: nodes[2].id },
                            { source: nodes[0].id, target: nodes[2].id }
                        ],
                    edgesDel: []
                });
                done();
            });
        });
    });
    describe("#addEdge()", function() {
        it("should call neo4j driver with correct query and params", function(done) {
            var Neo4j = proxyquire("../src/neo4j", {"neo4j-driver": neo4jdriverStub}).default;
            var n4jd = new neo4jdriver();
            neo4jdriverStub.v1.driver = n4jd.driver;
            neo4jdriverStub.v1.session = n4jd.session;
            neo4jdriverStub.v1.run = n4jd.run;
            var db = new Neo4j(true);
            db.addEdge(nodes[0].id, nodes[3].id).then(function(result) {
                assert.equal(query, "MATCH (n:Host) WHERE ID(n) = $source MATCH (m:Host) WHERE ID(m) = $target CREATE (n)-[c:CONNECTION]->(m)");
                assert.deepEqual(params, {source: neo4jdriverStub.v1.int(nodes[0].id), target:  neo4jdriverStub.v1.int(nodes[3].id)});
                done();
            });
        });
    });
  describe("#delNode()", function() {
    it("should call neo4j driver with correct query and params", function(done) {
        var Neo4j = proxyquire("../src/neo4j", {"neo4j-driver": neo4jdriverStub}).default;
        var n4jd = new neo4jdriver();
        neo4jdriverStub.v1.driver = n4jd.driver;
        neo4jdriverStub.v1.session = n4jd.session;
        neo4jdriverStub.v1.run = n4jd.run;
        var db = new Neo4j(true);
        db.delNode("foo.com").then(function(result) {
            assert.equal(query, "MATCH p = (n:Host {hostname: $hostname}) DETACH DELETE n");
            assert.deepEqual(params, {hostname: "foo.com"});
            done();
        });
    });
  });
});

function storeNode(result) {
    nodes.push(result);
}

class neo4jdriver {
    constructor() {
    }
    driver(uri, auth) {
        return this;
    }
    session() {
        return this;
    }
    run(q, p) {
        query = q;
        params = p;
        return Promise.resolve(0);
    }
}

class record {
    constructor(records) {
        this.records = records;
    }
    get(index) {
        return records[index];
    }
}