import KoaRouter from "koa-router";

const api = KoaRouter();

api.get("/ip/:addr/:depth",
    async (ctx, next) => {
        const { addr, depth } = ctx.params;
        var key = "addr:" + addr + "," + depth;
        ctx.session.data = {key: key, nodes: new Map(), edges: new Map()};
        ctx.websocket.query = {ip: addr, hostname: null, depth: depth};
        ctx.websocket.session = ctx.session;
        const data = await ctx
            .state
            .neo4j.getByIp(ctx.session.data, addr, depth);
        ctx.websocket.send(JSON.stringify(data));
    }
);

api.get("/hostname/:name/:depth",
    async (ctx, next) => {
        const { name, depth } = ctx.params;
        var key = "name:" + name + "," + depth;
        ctx.session.data = {key: key, nodes: new Map(), edges: new Map()};
        ctx.websocket.query = {ip: null, hostname: name, depth: depth};
        ctx.websocket.session = ctx.session;
        const data = await ctx
            .state
            .neo4j.getByHostname(ctx.session.data, name, depth);
        ctx.websocket.send(JSON.stringify(data));
    }
);

export default api;