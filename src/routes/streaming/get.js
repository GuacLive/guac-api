import { send } from 'micro';
import { compose } from 'micro-hoofs';

import fs from 'fs';
import streamModel from '../../models/stream';

import verifyJWTKey from '../../services/verifyJWTKey';
module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		if(!req.user){
			return send(res, 403, {
				statusCode: 403
			})
		}
		const stream = new streamModel;
		const result = await stream.getStreamKey(req.user.user_id);
		send(res, 200, {
			statusCode: 200,
			key: result.stream_key
		});
	}
);