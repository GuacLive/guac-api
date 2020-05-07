import { send } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

import verifySecretKey from '../../services/verifySecretKey';

module.exports = compose(
	verifySecretKey
)(
	async (req, res) => {
		const u = new userModel;
		if(!req.params.id){
			return send(res, 404, {
				statusCode: 404
			});
		}
		const user = await u.getUserById(
			req.params.id
		);
		if(user){
			return send(res, 200, {
				statusCode: 200,
				data: user
			});
		}else{
			return send(res, 400, {
				statusCode: 400
			});
		}
	}
);