import { send } from 'micro';
import { compose } from 'micro-hoofs';

import channelModel from '../../models/channel';

import verifyJWTKey from '../../services/verifyJWTKey';
module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
        const channel = new channelModel;
		const result = await channel.getFollowing(req.params.name);
		send(res, 200, {
			statusCode: 200,
			data: result
		});
	}
);