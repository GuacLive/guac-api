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
		if(req.json.channel){
			/*
				Authentication is done through secret key.
				This is because validation is done locally on the chat server...
				Change this to JWT at some point?
			*/
			const data = await channel.getBans(req.json.channel);
			return send(res, 200, {
				statusCode: 200,
				data
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