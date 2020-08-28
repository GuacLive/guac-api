var path = require('path');
var nconf = require('nconf');

const ENV = process.env.NODE_ENV || 'production';

var config = nconf.argv().env().file(path.join('config', path.sep, `${ENV}.json`));
module.exports = {
	development: {
		client: config.get('database:client'),
		connection: {
			host: config.get('database:connection:host'),
			user: config.get('database:connection:user'),
			password: config.get('database:connection:password'),
			database: config.get('database:connection:database')
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: __dirname + '/migrations',
		}
	},
	production: {
		client: config.get('database:client'),
		connection: {
			host: config.get('database:connection:host'),
			user: config.get('database:connection:user'),
			password: config.get('database:connection:password'),
			database: config.get('database:connection:database')
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: __dirname + '/migrations',
		}
	}
};