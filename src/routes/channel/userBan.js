import { send } from 'micro';
import { compose, parseJSONInput } from 'micro-hoofs';

import channelModel from '../../models/channel';

import verifySecretKey from '../../services/verifySecretKey';

module.exports = compose(
	verifySecretKey,
	parseJSONInput
)(
	async (req, res) => {
		const channel = new channelModel;
		if(req.json && req.json.channel && req.json.user){
			/*
				Authentication is done through secret key.
				This is because validation is done locally on the chat server...
				Change this to JWT at some point?
			*/
			const result = await channel.userBan(req.json.channel, req.json.user, 'No reason provided');
			return send(res, 200, {
				statusCode: 200
			});
		}else{
			// ???
			return send(res, 401, {
				statusCode: 401,
				statusMessage: 'Channel not found'
			});
		}
	}
);