import { send } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey,
)(
	async (req, res) => {
		const user = new userModel;
		const data = await user.getSubscriptions(req.user.id);
		if(data){
			return send(res, 200, {
				statusCode: 200,
				data
			});
		}else{
			send(res, 404, {
				statusCode: 404,
				statusMessage: 'No subscriptions found'
			});
		}
	}
);