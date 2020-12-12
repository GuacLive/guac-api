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
		const result = await u.getUsers(
			query['patreon.isPatron'] || null,
			parseInt(query.page, 10)
		);
		if(result){
			return send(res, 200, {
				statusCode: 200,
				...result
			});
		}else{
			return send(res, 400, {
				statusCode: 400
			});
		}
	}
);