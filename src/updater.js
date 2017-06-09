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

api.post('/add_edge',
  async (ctx, next) => {
    ctx.websocket.on('message', async function(message) {
      var json = JSON.parse(message);
      var node = await ctx
        .state
        .neo4j.addEdge(json.source, json.target);
    });
  }
);

api.del('/delete_node',
  async (ctx, next) => {
      ctx.state.server.foreach(function(client) {
        if(client.readyState === WebSocket.OPEN) {

        }
      });
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