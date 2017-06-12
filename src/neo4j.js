const neo4j = require('neo4j-driver').v1;
const uri = "bolt://127.0.0.1:7687";
const user = "neo4j";
const password = "password";
class Neo4j {
   
   constructor(clear) {
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
        this.session = this.driver.session();

        if(clear) {
            var resultPromise = this.session.run(
                'MATCH (n) DETACH DELETE n'
            );
        }
   }

    async addNode(hostname, ip) {
        var promise = this.session.run(
            "CREATE (a:Host {hostname:$hostname, ip: $ip}) RETURN {id: ID(a), hostname: a.hostname, ip: a.ip}",
            {hostname: hostname, ip: ip}
        );
        return promise.then(result => {
            const singleRecord = result.records[0];
            const node = singleRecord.get(0);
            console.log("hostname: " + node.hostname + ", ip: " + node.ip + ", id: " + node.id.low);

            return {hostname: node.hostname, ip: node.ip, id: node.id.low};
        });
    }

    async delNode(hostname) {
        return this.session.run(
            "MATCH p = (n:Host {hostname: $hostname}) DETACH DELETE n",
            {hostname: hostname}
        );
    }

    async addEdge(source, target) {
        console.log("0. source: " + source + " => " + " target: " + target);
        var promise = this.session.run(
            "MATCH (n:Host) WHERE ID(n) = $source MATCH (m:Host) WHERE ID(m) = $target CREATE (n)-[c:CONNECTION]->(m)",
            {source: neo4j.int(source), target: neo4j.int(target)}
        );
        return promise.then(result => {
            console.log("1. source: " + source + " => " + " target: " + target);
        });
    }

    async getByIp(data, addr, depth) {
        var promise = this.session.run(
            "MATCH p = (n:Host {ip: $addr})-[c:CONNECTION*1.." + depth + "]-(m) RETURN p",
            {addr: addr}
        );
        this.data = data;
        console.log("1. Here");
        return promise.then(function(result) {
            console.log("2. Here");
            return this.processResult(result, this.data.nodes, this.data.edges);
        }.bind(this), function(reason) {
            console.log(reason);
        });
    }
    
    async getByHostname(data, name, depth) {
        var promise = this.session.run(
            "MATCH p = (n:Host {hostname: $name})-[c:CONNECTION*1.." + depth + "]-(m) RETURN p",
            {name: name}
        );
        this.data = data;
        return promise.then(function(result) {
            return this.processResult(result, this.data.nodes, this.data.edges);
        }.bind(this));
    }

    async processResult(result, nodes, edges, timestamp) {
        var nodesNew = new Map();
        var edgesNew = new Map();
        var nodesAdd = [];
        var nodesDel = [];
        var edgesAdd = [];
        var edgesDel = [];
        var match = null;
        result.records.forEach(function(element) {
            var record = element.get(0);
            if(match == null) {
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
            record.segments.forEach(function(edge) {
                edgesNew.set(edge.relationship.start.low + "," + edge.relationship.end.low, {
                    source: edge.relationship.start.low,
                    target: edge.relationship.end.low
                });
            });
        });
        for (var [key, value] of nodesNew.entries()) {
            if(!nodes.has(key)) {
                nodesAdd.push(value);
            }
        }
        for (var [key, value] of nodes.entries()) {
            if(!nodesNew.has(key)) {
                nodesDel.push(value);
            }
        }
        for (var [key, value] of edgesNew.entries()) {
            if(!edges.has(key)) {
                edgesAdd.push(value);
            }
        }
        for (var [key, value] of edges.entries()) {
            if(!edgesNew.has(key)) {
                edgesDel.push(value);
            }
        }
        console.log("4. Here");
        nodes.clear();
        console.log("4.1. Here");
        edges.clear();
        console.log("4.2. Here");
        for (var [key, value] of nodesNew.entries()) {
            nodes.set(key, value);
        }
        console.log("4.3. Here");
        for (var [key, value] of edgesNew.entries()) {
            edges.set(key,value);
        }
        console.log("5. Here nAdd: " + nodesAdd.length + ", nDel: " + nodesDel.length + ", eAdd: " + edgesAdd.length + ", eDel: ", edgesDel.length);
        return {nodesAdd: nodesAdd, nodesDel: nodesDel, edgesAdd: edgesAdd, edgesDel: edgesDel};
    }
}

export default Neo4j;