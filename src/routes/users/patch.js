import { send, json} from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

import verifySecretKey from '../../services/verifySecretKey';

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
		await u.updatePatreon(
			req.params.id,
			jsonData.patreon
		);

		const user = await u
			.getUserById(req.params.id)
			.then(data => {
				// yes this should be twice
				if (typeof data.patreon === 'string') {
					data.patreon = JSON.parse(data.patreon);
				}
				if (typeof data.patreon === 'string') {
					data.patreon = JSON.parse(data.patreon);
				}
				return data.patreon;
			}).catch(e => {
				console.error(e.message)
			});
		if(jsonData.patreon.isPatron === false && ['admin', 'staff'].indexOf(user.type) === -1){
			await u.changeColor(req.params.id, null);
		}else if(typeof jsonData.color !== 'undefined'){
			await u.changeColor(req.params.id, jsonData.color);
		}
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