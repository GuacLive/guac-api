import crypto from 'crypto';

import {
	send,
	json
} from 'micro';
import {
	compose
} from 'micro-hoofs';

import streamModel from '../../models/stream';

import verifyJWTKey from '../../services/verifyJWTKey';
import verifyUserStaff from '../../services/verifyUserStaff';
module.exports = compose(
	verifyJWTKey,
	verifyUserStaff
)(
	async (req, res) => {
		const stream = new streamModel;
		const jsonData = await json(req);
		if (
			jsonData &&
			jsonData.user_id
		) {
			let streamResult = await stream.create(jsonData.user_id);
			if (streamResult) {
				let key = crypto.randomBytes(20).toString('hex');
				await stream.addStreamKey(streamResult.id, key);
				return send(res, 200, {
					statusCode: 200,
					data: {
						key,
						...streamResult
					}
				});
			}
		}
	}
);