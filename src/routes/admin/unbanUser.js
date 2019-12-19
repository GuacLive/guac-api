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
module.exports = compose(
	verifyJWTKey,
	verifyUserStaff
)(
	async (req, res) => {
		const user = new userModel;
		const jsonData = await json(req);
		if (
			jsonData &&
			jsonData.user_id
		) {
			let banResult = await user.unban(jsonData.user_id);
			if(banResult) {
				return send(res, 200, {
					statusCode: 200,
					user_id: jsonData.user_id
				});
			}
		}
	}
);