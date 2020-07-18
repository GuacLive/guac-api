import { compose } from 'micro-hoofs';
import cache from 'micro-cacheable';

import { getFromViewerAPI } from '../../utils';
import streamModel from '../../models/stream';

// Cache response for 10 seconds
module.exports = cache(10 * 1000, compose(
)(
	async (req, res) => {
		const stream = new streamModel;
		const results = await stream.getFeatured();
		const data = await Promise.all(results.map(async (item) => {
				//await stream.increaseView(item.id);
				item = await stream.getStream(item.name);
				return {
					id: item.id,
					name: item.name,
					title: item.title,
					live: parseInt(item.live, 10),
					viewers: item.live ? await getFromViewerAPI(item.name) : 0,
					views: parseInt(item.views, 10),
					urls: {
						hls: `/live/${item.name}/abr.m3u8`,
						flv: `/live/${item.name}.flv`
					},
					qualities: {
						//'source': '_src',
						'source': '',
						//'720p': '_high',
						//'480p': '_medium',
						//'360p': '_low',
						//'240p': '_mobile'
					},
					servers: global.nconf.get('server:streaming_servers'),
					user: {
						id: item.user_id,
						name: item.name,
						type: item.type,
						avatar: item.avatar || `//api.${global.nconf.get('server:domain')}/avatars/unknown.png`,
						banned: item.banned
					}
				};
			})
			.sort((a, b) => {return a.viewers < b.viewers;})
		);
		return {
			statusCode: 200,
			data
		};
	}
));