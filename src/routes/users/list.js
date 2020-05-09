import { send } from 'micro';
import { compose } from 'micro-hoofs';

import { parse } from 'url';

import userModel from '../../models/user';

import verifySecretKey from '../../services/verifySecretKey';

module.exports = compose(
	verifySecretKey
)(
	async (req, res) => {
		const { query } = await parse(req.url, true);
		const u = new userModel;
		const users = await u.getUsers(
			query['patreon.isPatron'] || null,
			parseInt(query.$limit, 10),
			parseInt(query.$skip, 10)
		);
		if(users){
			return send(res, 200, {
				statusCode: 200,
				data: users
			});
		}else{
			return send(res, 400, {
				statusCode: 400
			});
		}
	}
);