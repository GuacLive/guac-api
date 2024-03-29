import path from 'path';
import nconf from 'nconf';
import * as Sentry from '@sentry/node';

import Boom from '@hapi/boom';

import dayjs from 'dayjs'

const {PrismaClient} = require('@prisma/client');
import knexConfiguration from '../knexfile';

const ENV = process.env.NODE_ENV || 'production';

var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

nconf.argv().env();
nconf.file('default', path.join('config', path.sep, `${ENV}.json`));
nconf.set('base_dir', __dirname);
nconf.defaults({
	server: {
		name: 'guac.live',
		domain: 'guac.live',
		register_type: 0,
		chat_url: 'https://chat.guac.live',
		viewer_api_url: 'https://viewer-api.guac.live',
		viewer_api_key: null,
		streaming_servers: {
			'eu': '//stream.guac.live'
		},
		whitelist: [
			/(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/
		],
		whitelist_secret: ''
	},
	nms: {
		host: 'https://stream.guac.live',
		user: 'nms',
		password: 'nms'
	},
	sendgrid: {
		api_key: ''
	},
	s3: {
		endpoint: 'nyc3.digitaloceanspaces.com',
		cdn_endpoint: 'https://cdn.guac.live',
		access_key: '',
		secret_key: ''
	},
	patreon: {
		client_id: '',
		client_secret: '',
		campaign_id: '',
	},
	sentry: {
		dsn: ''
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
const dbNow = () => dayjs().utc().format();

global.nconf = nconf;
global.dbInstance = initLegacyKnex();
global.prisma = initDb();
global.dbNow = dbNow;

Sentry.init({
	dsn: nconf.get('sentry:dsn'),
	integrations: [

		// enable HTTP calls tracing

		new Sentry.Integrations.Http({tracing: true}),

	],

	// Set tracesSampleRate to 1.0 to capture 100%

	// of transactions for performance monitoring.

	// We recommend adjusting this value in production

	tracesSampleRate: 0.1,
});

const isPrimitive = (val) => Object(val) !== val;

function subtract2Hours(obj) {
	if (!obj)
		return;
	for (const key of Object.keys(obj)) {
		const val = obj[key];
		if (val instanceof Date) {
			obj[key] = dayjs(val).subtract(2, 'hour').toDate();
		}
		else if (!isPrimitive(val)) {
			subtract2Hours(val);
		}
	}
}
function prismaTimeMod(value) {
	if (value instanceof Date) {
		return dayjs(value).subtract(2, 'hour').toDate();
	}
	if (isPrimitive(value)) {
		return value;
	}
	subtract2Hours(value);
	return value;
}

function initLegacyKnex() {
	const knex = require('knex')(knexConfiguration[ENV]);
	const {attachPaginate} = require('knex-paginate');
	attachPaginate();
	return knex;
}

function initDb() {
	const prisma = new PrismaClient({
		datasources: {
			db: {
				url: `mysql://${nconf.get('database:connection:user')}:${nconf.get('database:connection:password')}@${nconf.get('database:connection:host')}:3306/${nconf.get('database:connection:database')}`,
			},
		},
	})
	prisma.$use(async (params, next) => {
		const result = await next(params);
		//return prismaTimeMod(result);
		return result;
	});
	return prisma;
}

import {send} from 'micro';
import {compose} from 'micro-hoofs';
import microCors from 'micro-cors';
import {router, get, post, del, patch} from 'micro-fork';
import ratelimit from 'micro-ratelimit2';
import {handleErrors} from 'micro-boom';
import Redis from 'ioredis';

const corsMiddleware = microCors({
	allowMethods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
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
		if (req.headers['x-guac-bypass'] === nconf.get('server:whitelist_secret')) {
			return true;
		}
		return nconf.get('server:whitelist')
			.some(r => req.headers.hasOwnProperty('x-forwarded-for') ? r.test(req.headers['x-forwarded-for']) : r.test(req.connection.remoteAddress.replace(/^.*:/, '')));
	}
});

const sentryMiddleware = fn => {
	return async function sentryMiddleware(request, response) {
		try {
			return await fn(request, response);
		} catch (error) {
			Sentry.captureException(error);
			let status = response?.statusCode ?? 500;
			if (status < 400) status = 500;
			const err = Boom.boomify(error, {statusCode: status});
			console.log(
				Object.assign({}, err.output.payload, err.data && {data: err.data}));
			send(
				response,
				status,
				Object.assign({}, err.output.payload, err.data && {data: err.data})
			);
		}
	}
}

const middleware = compose(...[
	//handleErrors,
	corsMiddleware,
	sentryMiddleware,
	//rateLimitMiddleware,
]);

const notfound = async (req, res) => {
	send(res, 404, await Promise.resolve({
		statusCode: 404,
		statusMessage: 'Route not found'
	}))
};

module.exports = router()(
	del('/archive', middleware(require('./routes/archive/del'))),
	post('/avatar', middleware(require('./routes/avatar/saveAvatar'))),
	post('/clip/:name', middleware(require('./routes/clip/post'))),
	// PayPal IPN api
	post('/payments/ipn', middleware(require('./routes/payments/ipn'))),
	post('/register', middleware(require('./routes/auth/register'))),
	post('/activate', middleware(require('./routes/auth/activate'))),
	post('/auth', middleware(require('./routes/auth/login'))),
	post('/tokenAuth', middleware(require('./routes/tokenAuth/post'))),
	post('/live/publish', middleware(require('./routes/live/publish'))),
	post('/live/on_publish_done', middleware(require('./routes/live/publishDone'))),
	post('/archive', middleware(require('./routes/archive/post'))),
	post('/user/verifyPatreon', middleware(require('./routes/user/verifyPatreon'))),
	post('/user/color', middleware(require('./routes/user/color'))),
	post('/user/password', middleware(require('./routes/user/password'))),
	post('/category', middleware(require('./routes/category/post'))),
	post('/channel/bans', middleware(require('./routes/channel/bans'))),
	post('/channel/timeouts', middleware(require('./routes/channel/timeouts'))),
	post('/channel/userBan', middleware(require('./routes/channel/userBan'))),
	post('/channel/userUnban', middleware(require('./routes/channel/userUnban'))),
	post('/channel/userMod', middleware(require('./routes/channel/userMod'))),
	post('/channel/userUnmod', middleware(require('./routes/channel/userUnmod'))),
	post('/channel/setArchiveStatus', middleware(require('./routes/channel/setArchiveStatus'))),
	post('/channel/userTimeout', middleware(require('./routes/channel/userTimeout'))),
	post('/channel/setTitle', middleware(require('./routes/channel/setTitle'))),
	post('/channel/banner', middleware(require('./routes/channel/saveBanner'))),
	post('/channel/setPrivate', middleware(require('./routes/channel/setPrivate'))),
	post('/channel/setCategory', middleware(require('./routes/channel/setCategory'))),
	post('/follow', middleware(require('./routes/follow/post'))),
	post('/follows', middleware(require('./routes/follows/post'))),
	// Firebase cloud messaging
	post('/fcm', middleware(require('./routes/fcm/post'))),
	post('/panels', middleware(require('./routes/panels/post'))),
	post('/search', middleware(require('./routes/search/post'))),
	post('/search/categories', middleware(require('./routes/search/categories'))),
	// To add a stream to database
	post('/admin/stream', middleware(require('./routes/admin/createStream'))),
	// Globally ban user (from chat and streaming)
	post('/admin/user/ban', middleware(require('./routes/admin/banUser'))),
	// Globally unban user (from chat and streaming)
	post('/admin/user/unban', middleware(require('./routes/admin/unbanUser'))),
	post('/*', notfound),
	// Users API (used by verify-patreons)
	patch('/users/:id', middleware(require('./routes/users/patch'))),
	patch('/*', notfound),
	// OAuth
	get('/nodeinfo/2.0', middleware(require('./routes/nodeinfo/2.0'))),
	// OAuth
	get('/oauth/patreon', middleware(require('./routes/oauth/patreon'))),
	// Users API (used by verify-patreons)
	get('/users/:id', middleware(require('./routes/users/user'))),
	get('/users', middleware(require('./routes/users/list'))),
	// Auth username API (used to check if username available)
	get('/auth/username/:username', middleware(require('./routes/auth/username'))),
	// Activitypub API
	get('/actor/:username', middleware(require('./routes/actor/get'))),
	// To get users currently banned
	get('/admin/bans', middleware(require('./routes/admin/getBanned'))),
	// To get NMS streams currently live
	get('/admin/streams', middleware(require('./routes/admin/getStreams'))),
	// To stop a NMS stream currently live
	get('/admin/stopStream/:name', middleware(require('./routes/admin/stopStream'))),
	get('/channel/subscription/:name', middleware(require('./routes/channel/subscription'))),
	get('/channel/follows/:name', middleware(require('./routes/channel/follows'))),
	get('/user/subscriptions', middleware(require('./routes/user/subscriptions'))),
	get('/edges', middleware(require('./routes/edges/get'))),
	get('/categories', middleware(require('./routes/categories/get'))),
	get('/clip/:uuid', middleware(require('./routes/clip/get'))),
	get('/clips/:name', middleware(require('./routes/clips/get'))),
	get('/channels', middleware(require('./routes/channels/get'))),
	get('/streaming', middleware(require('./routes/streaming/get'))),
	get('/streamConfig/:name', middleware(require('./routes/streamConfig/get'))),
	get('/featured', middleware(require('./routes/featured/get'))),
	get('/archive/:name', middleware(require('./routes/archive/get'))),
	get('/getArchive/:id', middleware(require('./routes/archive/id'))),
	get('/product/:name', corsMiddleware(middleware(require('./routes/product/get')))),
	get('/mods/:name', middleware(require('./routes/mods/get'))),
	get('/watch/:name', middleware(require('./routes/watch/get'))),
	get('/notifications', middleware(require('./routes/notifications/get'))),
	get('/messages/:name', middleware(require('./routes/messages/get'))),
	get('/', middleware(require('./routes/index/get'))),
	get('/*', notfound),
);