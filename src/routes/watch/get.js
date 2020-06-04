import { send } from 'micro';
import { compose } from 'micro-hoofs';
import fetch from 'node-fetch';

import channelModel from '../../models/channel';
import streamModel from '../../models/stream';

import { USERNAME_REGEX } from '../../utils';
function getFromViewerAPI(name){
	return new Promise((resolve, reject) => {
		fetch(`${global.nconf.get('server:viewer_api_url')}/viewers/${name}`)
		.then(r => r.json())
		.then(response => {
			resolve(response && response.viewers ? response.viewers : 0);
		})
		.catch(error => {
			resolve(0);
		});
	})
}

module.exports = compose(
)(
	async (req, res) => {
		if(!req.params.name || !USERNAME_REGEX.test(req.params.name)){
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No stream name given'
			});
		}
		const channel = new channelModel;
		const stream = new streamModel;
		const result = await stream.getStream(req.params.name);
		console.log(req.params, result);
		if(result && result.id){
			const mods = await channel.getMods(result.id);
			await stream.increaseView(result.id);
			send(res, 200, {
				statusCode: 200,
				data: {
					id: result.id,
					name: result.name,
					type: result.stream_type,
					title: result.title,
					live: parseInt(result.live, 10),
					liveAt: result.time,
					followers: await stream.getStreamFollowCount(result.user_id),
					viewers: await getFromViewerAPI(result.name),
					views: parseInt(result.views, 10),
					private: result.private,
					category_id: result.category_id,
					category_name: result.category_name,
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
					servers: global.nconf.get('server:streaming_servers'),
					user: {
						id: result.user_id,
						name: result.name,
						type: result.type,
						avatar: result.avatar || `//api.${global.nconf.get('server:domain')}/avatars/unknown.png`,
						banned: result.banned,
						patreon: stream.patreon ? {
							isPatron: stream.patreon.isPatron || false,
							tier: stream.patreon.tier
						} : null
					},
					mods: typeof mods == 'object' ? mods.map((m) => {return m && m.user_id}).filter(id => id) : [],
					panels: await stream.getPanels(result.user_id),
					subEnabled: await stream.hasSubscriptionPlans(result.id)
				}
			});
		}else{
			send(res, 404, {
				statusCode: 404,
				statusMessage: 'Stream not found'
			});
		}
	}
);