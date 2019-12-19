import {
	send,
	json
} from 'micro';
import {
	compose
} from 'micro-hoofs';

import userModel from '../../models/user';

import verifyJWTKey from '../../services/verifyJWTKey';
import verifyUserStaff from '../../services/verifyUserStaff';
// This will ban the user but NOT STOP A LIVE STREAM
module.exports = compose(
	verifyJWTKey,
	verifyUserStaff
)(
	async (req, res) => {
		const user = new userModel;
		const jsonData = await json(req);
		if (
			jsonData &&
			jsonData.user_id &&
			jsonData.reason
		) {
			let banResult = await user.ban(jsonData.user_id, jsonData.reason);
			if(banResult) {
				return send(res, 200, {
					statusCode: 200,
					user_id: jsonData.user_id,
					reason: jsonData.reason
				});
			}
		}
	}
);