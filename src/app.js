import Koa from 'koa';
import api from './api';
import www from './www';
import config from './config';
import bodyParser from 'koa-bodyparser';
import cors from 'kcors';
import hbs from 'koa-hbs';
import session from 'koa-session';
import websockify from 'koa-websocket';
import url from 'url';
import updater from './updater';
import * as swagger from 'swagger2';
import {validate, ui} from 'swagger2-koa';

var sessions = new Map();
var maximumAge = 86400000;
const CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    store: {get: getSession, set: setSession, destroy: destroySession},
    maxAge: maximumAge,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: false, /** (boolean) signed or not (default true) */
};
const document = swagger.loadDocumentSync("./swagger.yaml");

if (!swagger.validateDocument(document)) {
    throw Error("./swagger.yaml does not conform to the Swagger 2.0 schema");
}
async function getSession(key) {
    if(!sessions.has(key)) {
        sessions.set(key, {session: {nodes: new Map(), edges: new Map()}, maxAge: maximumAge});
    }
    var session = sessions.get(key).session;
    return new Promise(resolve => {resolve(session);});
}

async function setSession(key, sess, maxAge) {
    sessions.set(key, {session: sess, maxAge: maxAge});
    setTimeout(() => {
        sessions.delete(key);
    }, maxAge);
    return new Promise(resolve => {resolve();});
}

async function destroySession(key) {
    sessions.delete(key);
    return new Promise(resolve => {resolve();});
}

const broadcaster = websockify(new Koa(), {clientTracking: true});

broadcaster.ws.use(session(CONFIG, broadcaster));
broadcaster.ws.use(async (ctx, next) => {
        ctx.state.neo4j = config.neo4j;
        ctx.state.server = broadcaster.ws.server;
        await next();
    })
    .use(bodyParser())
    .use(api.routes())
    .use(api.allowedMethods())
    .use(validate(document));

const webpage = new Koa();

webpage.use(hbs.middleware({
        viewPath:   __dirname + '/views'
    }))
    .use(bodyParser())
    .use(www.routes())
    .use(www.allowedMethods())
    .use(ui(document, "/swagger"));

const updaterApp = websockify(new Koa());
updaterApp.ws.use(async (ctx, next) => {
        ctx.state.neo4j = config.neo4j;
        ctx.state.server = broadcaster.ws.server;
        await next();
    })
    .use(updater.routes())
    .use(updater.allowedMethods());

export default {webpage: webpage, broadcaster: broadcaster, updater: updaterApp};