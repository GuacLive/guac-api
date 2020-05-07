import { send, json} from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../models/user';

import verifySecretKey from '.../services/verifySecretKey';

module.exports = compose(
	verifySecretKey
)(
	async (req, res) => {
		const jsonData = await json(req);
		if(!req.params.id || !jsonData || !jsonData.patreon){
			return send(res, 404, {
				statusCode: 404
			});
		}
		const u = new userModel;
		const user = await u.updatePatreon(
			req.params.id,
			jsonData.patreon
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