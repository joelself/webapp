import KoaRouter from 'koa-router';

const api = KoaRouter();

api.get('/ip/:addr/:depth',
  async (ctx, next) => {
    console.log("0. received query");
    const { addr, depth } = ctx.params;
    console.log("1. received query: " + addr + ", depth: " + depth);
    var key = "addr:" + addr + "," + depth;
    ctx.session.data = {key: key, nodes: new Map(), edges: new Map()};
    ctx.websocket.query = {ip: addr, hostname: null, depth: depth};
    ctx.websocket.session = ctx.session;
    console.log("client count: " + ctx.state.server.clients.length);
    console.log("2. received query: " + addr + ", depth: " + depth);
    const data = await ctx
      .state
      .neo4j.getByIp(ctx.session.data, addr, depth);
    console.log("6. Here");
    console.log(data);
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