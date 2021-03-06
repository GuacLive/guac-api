import { send , json} from 'micro';
import { compose } from 'micro-hoofs';

import channelModel from '../../models/channel';

import verifySecretKey from '../../services/verifySecretKey';

module.exports = compose(
	verifySecretKey,
)(
	async (req, res) => {
		const channel = new channelModel;
		const jsonData = await json(req);
		if(jsonData.channel){
			/*
				Authentication is done through secret key.
				This is because validation is done locally on the chat server...
				Change this to JWT at some point?
			*/
			const data = await channel.getTimeouts(jsonData.channel);
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