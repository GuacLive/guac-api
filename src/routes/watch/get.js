import { send } from 'micro';
import cache from 'micro-cacheable';

import channelModel from '../../models/channel';
import streamModel from '../../models/stream';
import userModel from '../../models/user';

import { USERNAME_REGEX, getFromViewerAPI } from '../../utils';

// Cache response for 1 second
module.exports = cache(1 * 1000, async (req, res) => {
		if(!req.params.name || !USERNAME_REGEX.test(req.params.name)){
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No stream name given'
			});
		}
		const channel = new channelModel;
		const stream = new streamModel;
		const user = new userModel;
		const result = await stream.getStream(req.params.name);
		var lastBan;
		console.log(req.params, result);
		if(result && result.id){
			const mods = await channel.getMods(result.id);
			if(result.banned && result.user_id){
				lastBan = await user.getLastBan(result.user_id);
			}else{
				await stream.increaseView(result.id);
			}
			return {
				statusCode: 200,
				data: {
					id: result.id,
					name: result.name,
					type: result.stream_type,
					title: result.title,
					live: parseInt(result.live, 10),
					liveAt: result.time,
					followers: await stream.getStreamFollowCount(result.user_id),
					viewers: result.live ? await getFromViewerAPI(result.name) : 0,
					views: parseInt(result.views, 10),
					private: result.private,
					category_id: result.category_id,
					category_name: result.category_name,
					banner: result.banner,
					mature: result.mature,
					urls: {
						hls: `/live/${result.name}/abr.m3u8`,
						flv: `/live/${result.name}.flv`
					},
					qualities: {
						//'source': '_src',
						'source': '',
						//'720p': '_high',
						//'480p': '_medium',
						//'360p': '_low',
						//'240p': '_mobile'
					},
					streamServer: result.streamServer,
					user: {
						id: result.user_id,
						name: result.name,
						type: result.type,
						avatar: result.avatar || `${global.nconf.get('s3:cdn_endpoint')}/profile-avatars/offline-avatar.png`,
						banned: result.banned,
						lastBan,
						patreon: stream.patreon ? {
							isPatron: stream.patreon.isPatron || false,
							tier: stream.patreon.tier
						} : null
					},
					mods: typeof mods == 'object' ? mods.map((m) => {return m && m.user_id}).filter(id => id) : [],
					panels: await stream.getPanels(result.user_id),
					subEnabled: await stream.hasSubscriptionPlans(result.id)
				}
			};
		}else{
			console.log('what is going on');
			console.log(result);
			return {
				statusCode: 404,
				statusMessage: 'Stream not found'
			};
		}
	}
);