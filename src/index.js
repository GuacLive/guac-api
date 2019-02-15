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
		}
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
import rateLimit from 'micro-ratelimit';
import { handleErrors } from 'micro-boom';

const corsMiddleware = microCors({
	allowMethods: ['POST','GET','PUT','PATCH','DELETE','OPTIONS'],
	allowHeaders: [ 'Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
	maxAge: 86400,
	origin: '*',
	runHandlerOnOptionsRequest: true
});

const rateLimitMiddleware = rateLimit.bind(rateLimit, {
	window: 10000,
	limit: 4,
	headers: true
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
	post('/auth', middleware(require('./routes/auth/post'))),
	post('/tokenAuth', middleware(require('./routes/tokenAuth/post'))),
	post('/live/publish', middleware(require('./routes/live/publish'))),
	post('/live/on_publish_done', middleware(require('./routes/live/publishDone'))),
	post('/*', notfound),
	get('/edges', middleware(require('./routes/edges/get'))),
	get('/channel/userBan', middleware(require('./routes/channel/userBan'))),
	get('/channel/userUnban', middleware(require('./routes/channel/userUnban'))),
	get('/channels', middleware(require('./routes/channels/get'))),
	get('/streaming', middleware(require('./routes/streaming/get'))),
	get('/featured', middleware(require('./routes/featured/get'))),
	get('/watch/:name', middleware(require('./routes/watch/get'))),
	get('/', middleware(require('./routes/index/get'))),
	get('/*', notfound),
);