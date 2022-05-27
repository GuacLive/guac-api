import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import channelModel from '../../models/channel';

import verifyJWTKey from '../../services/optionalJWT';

import { getAllFromViewerAPI } from '../../utils';
module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const channel = new channelModel;
		const jsonData = await json(req);
		let result;
		if(typeof jsonData.from_id !== 'undefined'){
			result = await channel.getFollowsFrom(jsonData.from_id);
		}else if(typeof jsonData.to_id !== 'undefined'){
			result = await channel.getFollowsTo(jsonData.to_id);
		}else if(req.user && typeof req.user.id !== 'undefined'){
			result = await channel.getFollowsFrom(req.user.id);
		}else{
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No from_id or to_id given'
			});
		}

		const allViewers =  await getAllFromViewerAPI();

		result = await Promise.all(result.map(async (r) => {
			const viewers = allViewers.find(viewer => viewer.username === r.name)?.viewers;
			if(r){
				r.avatar = r.avatar || `${global.nconf.get('s3:cdn_endpoint')}/profile-avatars/offline-avatar.png`;
				r.viewers = viewers ?? 0;
			}
			return r;
		}));
		send(res, 200, {
			statusCode: 200,
			data: result
		});
	}
);