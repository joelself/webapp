import KoaRouter from 'koa-router';

const www = KoaRouter();

www.get('/',
    async (ctx, next) => {
        console.log(ctx);
        await ctx.render('index');
    }
);


export default www;