import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import channelModel from '../../models/channel';

import verifyJWTKey from '../../services/verifyJWTKey';

import { getFromViewerAPI } from '../../utils';
module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const channel = new channelModel;
		const jsonData = await json(req);
		let result;
		if(typeof jsonData.from_id !== 'undefined'){
			result = await channel.getFollowsFrom(jsonData.from_id);
		}else if(typeof jsonData.from_id !== 'undefined'){
			result = await channel.getFollowsTo(jsonData.to_id);
		}else if(req.user && typeof req.user.id !== 'undefined'){
			result = await channel.getFollowsFrom(req.user.id);
		}else{
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No from_id or to_id given'
			});
		}

		result = await Promise.map(result, async (r) => {
			if(r){
				r.avatar = r.avatar || `//api.${global.nconf.get('server:domain')}/avatars/unknown.png`;
				if(r.live){
					r.live = await getFromViewerAPI(r.name);
				}else{
					r.live = 0;
				}
			}
			return r;
		});
		send(res, 200, {
			statusCode: 200,
			data: result
		});
	}
);