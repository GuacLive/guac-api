import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import channelModel from '../../models/channel';

import verifyJWTKey from '../../services/verifyJWTKey';
module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const channel = new channelModel;
		const jsonData = await json(req);
		let result;
		if(jsonData.from_id){
			result = await channel.getFollowsFrom(jsonData.from_id);
		}else if(jsonData.to_id){
			result = await channel.getFollowsTo(jsonData.to_id);
		}
		if(!result){
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No from_id or to_id given'
			});
		}
		send(res, 200, {
			statusCode: 200,
			data: result
		});
	}
);