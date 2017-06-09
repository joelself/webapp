import KoaRouter from 'koa-router';

const www = KoaRouter();

www.get('/',
    async (ctx, next) => {
        console.log(ctx);
        await ctx.render('index');
    }
//   async (ctx, next) => {
//     const { addr, depth } = ctx.params;
//     const data = await ctx
//       .state
//       .neo4j.getByIp(addr, depth);

//     ctx.body = data;
//   }
);


export default www;