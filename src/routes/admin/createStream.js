import crypto from 'crypto';

import {
	send,
	json
} from 'micro';
import {
	compose
} from 'micro-hoofs';

import userModel from '../../models/user';
import streamModel from '../../models/stream';

import verifyJWTKey from '../../services/verifyJWTKey';
import verifyUserStaff from '../../services/verifyUserStaff';
module.exports = compose(
	verifyJWTKey,
	verifyUserStaff
)(
	async (req, res) => {
		const user = new userModel;
		const stream = new streamModel;
		const jsonData = await json(req);
		if (
			jsonData
		) {
			let u = null;
			if(jsonData.user_id){
				u = await user.getUserById(jsonData.user_id);
			}else if(jsonData.username){
				u = await user.getUserByUsername_lower(jsonData.username);
			}
			if(!u) return;
			let streamResult = await stream.create(u.user_id);
			if (streamResult) {
				let key = crypto.randomBytes(20).toString('hex');
				await stream.addStreamKey(streamResult.id, streamResult.user.id, key);
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