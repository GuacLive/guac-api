import path from 'path';
import nconf from 'nconf';
const ENV = process.env.NODE_ENV || 'production';

nconf.argv().env();
nconf.file('default', path.join('config', path.sep, `${ENV}.json`));
nconf.set('base_dir', __dirname);
nconf.defaults({
	server: {
		name: 'guac.live',
		domain: 'guac.live',
		register_type: 0,
		streaming_servers: {
			'eu': '//stream.guac.live'
		},
		whitelist: [
			/(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/
		]
	},
	nms: {
		host: 'https://stream.guac.live',
		user: 'nms',
		password: 'nms'
	},
	database: {
		client: 'mysql2',
		connection: {
			host: '127.0.0.1',
			user: 'your_database_user',
			password: 'your_database_password',
			database: 'myapp_test'
		}
	}
});
//nconf.save();

global.nconf = nconf;
global.dbInstance = initDb();

function initDb(){
	return require('knex')({
		client: nconf.get('database:client'),
		connection: {
			host: nconf.get('database:connection:host'),
			user: nconf.get('database:connection:user'),
			password: nconf.get('database:connection:password'),
			database: nconf.get('database:connection:database')
		}
	});
}

import { send } from 'micro';
import { compose } from 'micro-hoofs';
import microCors from 'micro-cors';
import { router, get, post, del } from 'microrouter';
import ratelimit from 'micro-ratelimit2';
import { handleErrors } from 'micro-boom';
import Redis from 'ioredis';

const corsMiddleware = microCors({
	allowMethods: ['POST','GET','PUT','PATCH','DELETE','OPTIONS'],
	allowHeaders: [ 'Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
	maxAge: 86400,
	origin: '*',
	runHandlerOnOptionsRequest: true
});

const rateLimitMiddleware = ratelimit.bind(ratelimit, {
	db: new Redis(),
	id: (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress.replace(/^.*:/, ''),
	max: 300,
	duration: 60 * 1000,
	whitelist: req => {
		return nconf.get('server:whitelist')
			.some(r => req.headers.hasOwnProperty('x-forwarded-for') ? r.test(req.headers['x-forwarded-for']) : r.test(req.connection.remoteAddress.replace(/^.*:/, '')));
	}
});

const middleware = compose(...[
	//handleErrors,
	corsMiddleware,
	rateLimitMiddleware,
]);

const notfound = async (req, res) => {
	send(res, 404, await Promise.resolve('Not found route'))
};

module.exports = router(
	post('/register', middleware(require('./routes/auth/register'))),
	post('/auth', middleware(require('./routes/auth/login'))),
	post('/tokenAuth', middleware(require('./routes/tokenAuth/post'))),
	post('/live/publish', middleware(require('./routes/live/publish'))),
	post('/live/on_publish_done', middleware(require('./routes/live/publishDone'))),
	post('/archive', middleware(require('./routes/archive/post'))),
	post('/user/password', middleware(require('./routes/user/password'))),
	post('/channel/bans', middleware(require('./routes/channel/bans'))),
	post('/channel/timeouts', middleware(require('./routes/channel/timeouts'))),
	post('/channel/userBan', middleware(require('./routes/channel/userBan'))),
	post('/channel/userUnban', middleware(require('./routes/channel/userUnban'))),
	post('/channel/userMod', middleware(require('./routes/channel/userMod'))),
	post('/channel/userUnmod', middleware(require('./routes/channel/userUnmod'))),
	post('/channel/userTimeout', middleware(require('./routes/channel/userTimeout'))),
	post('/channel/setTitle', middleware(require('./routes/channel/setTitle'))),
	post('/channel/setPrivate', middleware(require('./routes/channel/setPrivate'))),
	post('/channel/setCategory', middleware(require('./routes/channel/setCategory'))),
	post('/follow', middleware(require('./routes/follow/post'))),
	post('/follows', middleware(require('./routes/follows/post'))),
	post('/fcm', middleware(require('./routes/fcm/post'))),
	post('/search', middleware(require('./routes/search/post'))),
	post('/*', notfound),
	// To get NMS streams currently live
	get('/admin/streams', middleware(require('./routes/admin/getStreams'))),
	// To stop a NMS stream currently live
	get('/admin/stopStream/:name', middleware(require('./routes/admin/stopStream'))),
	// To add a stream to database
	post('/admin/stream', middleware(require('./routes/admin/createStream'))),
	// Globally ban user (from chat and streaming)
	post('/admin/user/ban', middleware(require('./routes/admin/banUser'))),
	// Globally unban user (from chat and streaming)
	post('/admin/user/ban', middleware(require('./routes/admin/unbanUser'))),
	get('/edges', middleware(require('./routes/edges/get'))),
	get('/categories', middleware(require('./routes/categories/get'))),
	get('/channels', middleware(require('./routes/channels/get'))),
	get('/streaming', middleware(require('./routes/streaming/get'))),
	get('/featured', middleware(require('./routes/featured/get'))),
	get('/archive/:name', middleware(require('./routes/archive/get'))),
	get('/watch/:name', middleware(require('./routes/watch/get'))),
	get('/avatars/:id', middleware(require('./routes/avatars/get'))),
	get('/', middleware(require('./routes/index/get'))),
	get('/*', notfound),
);