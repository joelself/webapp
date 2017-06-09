const neo4j = require('neo4j-driver').v1;
const uri = "bolt://127.0.0.1:7687";
const user = "neo4j";
const password = "password";
class Neo4j {
    constructor() {
        this.words = [];
        this.hosts = [];
        console.log(this.words.length);
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
        this.session = this.driver.session();
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('./list.txt')
        });
        lineReader.on('line', line => {
            if(line != "" && line.trim() != "") {
            console.log(this.words.length);
                console.log(line.trim());
                this.words.push(line.trim());
            }
        });
        lineReader.on('close', () => {
            this.populate();
        });
    }

    readLine(line) {
        if(line != "" && line.trim() != "") {
        console.log(this.words.length);
            console.log(line.trim());
            this.words.push(line.trim());
        }
    }

    populate() {
        var resultPromise = this.session.run(
            'MATCH (n) DETACH DELETE n'
        );
        var promises = [];
        resultPromise.then(result => {
            for(var i = 0; i < 10; i++) {
                var name = "";
                name += this.words[this.getRandomInt(this.words.length)] + "-" + this.words[this.getRandomInt(this.words.length)] + ".com";
                console.log("hostname: " + name);
                var ip = "10." + (Math.floor(i / 65536) % 256) + "." + (Math.floor(i / 256) % 256) + "." +  (i % 256);
                var promise = this.session.run(
                    'CREATE (a:Host {hostname:$name, ip: $ip}) RETURN {id: ID(a), hostname: a.hostname, ip: a.ip}',
                    {name: name, ip: ip}
                );
                promise.then(result => {
                    const singleRecord = result.records[0];
                    const node = singleRecord.get(0);
                    this.hosts.push({hostname: node.hostname, ip: node.ip, id: node.id.low});
                    console.log(node.hostname);
                });
                promises.push(promise);
            }
            this.session.run(
                'CREATE INDEX ON :Host(hostname, ip)'
            );
            Promise.all(promises).then(values => {
                promises = this.makeConnections();
                Promise.all(promises).then(values => {
                    this.session.close();
                    console.log("Done creating nodes and edges.")
                });
            });
        });
    }

    makeConnections() {
        var promises = [];
        for(var i = 0; i < 24; i++) {
            var left = this.getRandomInt(this.hosts.length);
            var right = this.getRandomInt(this.hosts.length);
            while(left == right)
            right = this.getRandomInt(this.hosts.length);

            var host_left = this.hosts[left];
            var host_right = this.hosts[right];
            console.log(host_left.hostname + " => " + host_right.hostname);
            var promise = this.session.run(
                'MATCH (n:Host) WHERE ID(n) = $id_left MATCH (m:Host) WHERE ID(m) = $id_right CREATE (n)-[c:CONNECTION]->(m)',
                {id_left: neo4j.int(host_left.id), id_right: neo4j.int(host_right.id)}
            );
            promise.then(result => {

            //this.session.close();
            //console.log(node.id.low);
            });
            promises.push(promise);
        }
        return promises;
    }

    async getByIp(data, addr, depth) {
        console.log("length: " + data.nodes.size);
        console.log("length: " + data.edges.size);
        this.session = this.driver.session();
        const promise = this.session.run(
            'MATCH p = (n:Host {ip: $addr})-[c:CONNECTION*1..' + depth + ']-(m) RETURN p',
            {addr: addr}
        );
        return promise.then(function(result) {
            return this.processResult(result, this.data.nodes, this.data.edges);
        }.bind({data: data}));
    }
    
    async getByHostname(data, name, depth) {
        console.log("length: " + data.nodes.size);
        console.log("length: " + data.edges.size);
        this.session = this.driver.session();
        const promise = this.session.run(
            'MATCH p = (n:Host {hostname: $name})-[c:CONNECTION*1..' + depth + '}]-(m) RETURN p',
            {name: name}
        );
        return promise.then(function(result) {
            return this.processResult(result, this.data.nodes, this.data.edges);
        }.bind({data: data}));
    }

    async processResult(result, nodes, edges, timestamp) {
        console.log("length: " + nodes.size);
        console.log("length: " + edges.size);
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
        this.session.close();
        return {nodesAdd: nodesAdd, nodesDel: nodesDel, edgesAdd: edgesAdd, edgesDel: edgesDel, timestamp: timestamp};
    }


    getRandomInt(max) {
        return Math.floor(Math.random() * (max));
    }
    // async countBy(attr, val) {
    //     var count = await db
    //     .hget(`${this.name}_by_${attr}`, val);
    //     return Number(count);
    // }

    // async count() {
    //     var count = await db
    //     .zcount(`${this.name}`, '-inf', '+inf');
    //     return Number(count);
    // }

    // async add(event) {
    //     await db
    //     .zadd(`${this.name}`, 1, JSON.stringify(event));

    //     await this._incrGroups(event);
    // }

    // async _incrGroups(event) {
    //     for (let attr of this.groupBy) {
    //     await db.hincrby(`${this.name}_by_${attr}`, event[attr], 1);
    //     }
    // }

    // async clear() {
    //     await db.del(`${this.name}`);
    //     for (let attr of this.groupBy) {
    //     await db.del(`${this.name}_by_${attr}`);
    //     }
    // }
}

export default Neo4j;