import KoaRouter from 'koa-router';

const www = KoaRouter();

www.get('/',
    async (ctx, next) => {
        await ctx.render('index');
    }
);


export default www;