import KoaRouter from 'koa-router';
import WebSocket from 'ws';

const api = KoaRouter();

api.get('/add_edge',
  async (ctx, next) => {
    ctx.websocket.on('message', async function(message) {
        var json = JSON.parse(message);
        await this.ctx
            .state
            .neo4j.addEdge(json.source, json.target);
        var promises = [];
        this.ctx.state.server.clients.forEach(function(client) {
            if(client.readyState === WebSocket.OPEN) {
                var promise;
                if(client.query.ip)
                    promise = this.ctx.state.neo4j.getByIp(client.session.data, client.query.ip, client.query.depth);
                else
                    promise = this.ctx.state.neo4j.getByHostname(client.session.data, client.query.hostname, client.query.depth);
                promises.push(promise.then(function(data) {
                    if(data.nodesAdd.length > 0 || data.edgesAdd.length > 0) {
                        client.send(JSON.stringify(data));
                    }
                }));
            }
        }.bind({ctx: ctx}));
        await Promise.all(promises);
    }.bind({ctx: ctx}));
  }
);

api.get('/delete_node',
    async (ctx, next) => {
        ctx.websocket.on('message', async function(message) {
            var json = JSON.parse(message);
            await this.ctx
                .state
                .neo4j.delNode(json.hostname);
            var promises = [];
            this.ctx.state.server.clients.forEach(function(client) {
                if(client.readyState === WebSocket.OPEN) {
                    var promise;
                    if(client.query.ip)
                    promise = this.ctx.state.neo4j.getByIp(client.session.data, client.query.ip, client.query.depth);
                    else
                    promise = this.ctx.state.neo4j.getByHostname(client.session.data, client.query.hostname, client.query.depth);
                    promises.push(promise.then(function(data) {
                        if(data.nodesDel.length > 0 || data.edgesDel.length > 0) {
                            client.send(JSON.stringify(data));
                        }
                    }));
                }
            }.bind({ctx: ctx}));
            await Promise.all(promises);
        }.bind({ctx: ctx}));
    }
);

api.get('/add_node',
    async (ctx, next) => {
        ctx.websocket.on('message', async function(message) {
            var json = JSON.parse(message);
            var node = await this.ctx
                .state
                .neo4j.addNode(json.hostname, json.ip);
            this.ctx.websocket.send(JSON.stringify(node));
        }.bind({ctx: ctx}));
    }
);

export default api;