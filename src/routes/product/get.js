import { send } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

import { USERNAME_REGEX } from '../../utils';

module.exports = compose(
)(
	async (req, res) => {
		if(!req.params.name || !USERNAME_REGEX.test(req.params.name)){
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No stream name given'
			});
		}
		const stream = new streamModel;
		const streamResult = await stream.getStream(req.params.name);
		const plansResult = await stream.getPlans(req.params.name);
		if(streamResult && streamResult.id){
			send(res, 200, {
				statusCode: 200,
				data: {
					id: streamResult.id,
					name: streamResult.name,
					price: plansResult && plansResult[0] && plansResult[0].price ? plansResult[0].price : null,
					plans: plansResult
				}
			});
		}else{
			send(res, 404, {
				statusCode: 404,
				statusMessage: 'Stream not found'
			});
		}
	}
);