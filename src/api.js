import KoaRouter from "koa-router";

const api = KoaRouter();

api.get("/ip/:addr/:depth",
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

api.get("/hostname/:name/:depth",
    async (ctx, next) => {
        console.log("0. received query");
        console.log(ctx.params);
        const { name, depth } = ctx.params;
        console.log("1. received query: " + name + ", depth: " + depth);
        var key = "name:" + name + "," + depth;
        ctx.session.data = {key: key, nodes: new Map(), edges: new Map()};
        ctx.websocket.query = {ip: null, hostname: name, depth: depth};
        ctx.websocket.session = ctx.session;
        console.log("client count: " + ctx.state.server.clients.length);
        console.log("2. received query: " + name + ", depth: " + depth);
        const data = await ctx
            .state
            .neo4j.getByHostname(ctx.session.data, name, depth);
        console.log("6. Here");
        console.log(data);
        ctx.websocket.send(JSON.stringify(data));
    }
);

export default api;