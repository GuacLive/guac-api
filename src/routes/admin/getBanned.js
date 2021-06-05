import { send } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

import verifyJWTKey from '../../services/verifyJWTKey';
import verifyUserStaff from '../../services/verifyUserStaff';
module.exports = compose(
	verifyJWTKey,
	verifyUserStaff
)(
	async (req, res) => {
		const user = new userModel;	
		const data = await user.getBanned();
		send(res, 200, {
			statusCode: 200,
			data
		});
	}
);