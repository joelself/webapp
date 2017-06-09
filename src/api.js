import KoaRouter from 'koa-router';

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

// route.all('/ip', function(ctx) {
//   ctx.websocket.on('message', function(message) {
//     console.log("message");
//     ctx.websocket.send(message);
//   });
// });

api.get('/ip/:addr/:depth',
  async (ctx, next) => {
    const { addr, depth } = ctx.params;
    var key = "addr:" + addr + "," + depth;
    ctx.session.data = {key: key, nodes: new Map(), edges: new Map()};
    ctx.websocket.data = ctx.session.data;
    const data = await ctx
      .state
      .neo4j.getByIp(ctx.session.data, addr, depth);
    ctx.websocket.send(JSON.stringify(data));
  }
);
  
api.get('/hostname/:name/:depth',
  async (ctx, next) => {
    ctx.websocket.on('message', function(message) {
      const { name, depth } = ctx.params;
      var key = "name:" + name + "," + depth;
      ctx.session.data = {key: key, nodes: new Map(), edges: new Map()};
      ctx.websocket.data = ctx.session.data;
      const promise = ctx
        .state
        .neo4j.getByHostname(ctx.session.data, name, depth);
      promise.then(function(result) {
        this.ctx.body = result;
      }.bind({ctx: ctx}));
    });
  }
);

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