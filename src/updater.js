import KoaRouter from 'koa-router';
import WebSocket from 'ws';

const api = KoaRouter();

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

api.del('/delete_edge',
  async (ctx, next) => {
  }
);

api.get('/add_edge',
  async (ctx, next) => {
    ctx.websocket.on('message', async function(message) {
      console.log("\nadd_edge");
      var json = JSON.parse(message);
      await this.ctx
        .state
        .neo4j.addEdge(json.source, json.target);
      var promises = [];
      this.ctx.state.server.clients.forEach(function(client) {
          console.log("************************");
          if(client.readyState === WebSocket.OPEN) {
            var promise;
            console.log("#1 Here");
            if(client.query.ip)
              promise = this.ctx.state.neo4j.getByIp(client.session.data, client.query.ip, client.query.depth);
            else
              promise = this.ctx.state.neo4j.getByHostname(client.session.data, client.query.hostname, client.query.depth);
            console.log("#2 Here");
            promises.push(promise.then(function(data) {
            console.log("#3 Here");
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
      console.log("\ndel_edge");
      var json = JSON.parse(message);
      await this.ctx
        .state
        .neo4j.delNode(json.hostname);
      var promises = [];
      this.ctx.state.server.clients.forEach(function(client) {
          console.log("+++ DEL NODE ************************");
          if(client.readyState === WebSocket.OPEN) {
            var promise;
            console.log("#1 Here");
            if(client.query.ip)
              promise = this.ctx.state.neo4j.getByIp(client.session.data, client.query.ip, client.query.depth);
            else
              promise = this.ctx.state.neo4j.getByHostname(client.session.data, client.query.hostname, client.query.depth);
            console.log("#2 Here");
            promises.push(promise.then(function(data) {
            console.log("#3 Here");
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
    console.log("add_node");
    ctx.websocket.on('message', async function(message) {
      console.log(message);
      var json = JSON.parse(message);
      var node = await this.ctx
        .state
        .neo4j.addNode(json.hostname, json.ip);
      this.ctx.websocket.send(JSON.stringify(node));
    }.bind({ctx: ctx}));
  }
);

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
export default api;