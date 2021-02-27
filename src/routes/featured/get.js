import {compose} from 'micro-hoofs';
import cache from 'micro-cacheable';

import {getFromViewerAPI} from '../../utils';
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
				statusCode: 200,
				data: {
					id: item.id,
					name: item.name,
					type: item.stream_type,
					title: item.title,
					live: parseInt(item.live, 10),
					liveAt: item.time,
					followers: await stream.getStreamFollowCount(item.user_id),
					viewers: item.live ? await getFromViewerAPI(item.name) : 0,
					views: parseInt(item.views, 10),
					private: item.private,
					category_id: item.category_id,
					category_name: item.category_name,
					banner: item.banner,
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
					// DEPRECATED - Servers-field (KEEP UNTIL FRONTEND UPDATED)
					servers: global.nconf.get('server:streaming_servers'),
					streamServer: item.streamServer,
					user: {
						id: item.user_id,
						name: item.name,
						type: item.type,
						avatar: item.avatar || `${global.nconf.get('s3:cdn_endpoint')}/profile-avatars/offline-avatar.png`,
						banned: item.banned
					},
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