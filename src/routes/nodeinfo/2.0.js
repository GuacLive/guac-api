import { send } from 'micro';
import { compose } from 'micro-hoofs';
import cache from 'micro-cacheable';

import { parse } from 'url';

import userModel from '../../models/user';
import streamModel from '../../models/stream';

const version = require('../../../package.json').version;

// Cache response for 1 minute
module.exports = cache(60 * 1000, compose(
)(
	async (req, res) => {
		const { query } = await parse(req.url, true)
		const user = new userModel;
		const stream = new streamModel;
		const totalUsers = await user.getTotal();
		const totalStreams = await stream.getTotal();
		return {
			version: '2.0',
			software: {
				name: 'guac.live',
				version: version ? version : process.env.npm_package_version,
			},
			protocols: [
				'activitypub'
			],
			services: {
				inbound: [],
				outbound: []
			},
			openRegistrations: true,
			usage: {
				users: {
					total: totalUsers
				},
				localStreamers: totalStreams
			},
			metadata: {
				taxonomy: {
					postsName: 'Streams'
				},
				nodeName: global.nconf.get('server:name'),
				nodeDescription: 'live streaming platform',
			}
		};
	}
));