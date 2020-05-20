import { send } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

import verifyJWTKey from '../../services/verifyJWTKey';

import { USERNAME_REGEX } from '../../utils';
module.exports = compose(
	verifyJWTKey,
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
		if(streamResult && streamResult.user_id){
			const data = await stream.getSubscriptionToChannel(req.user.id, streamResult.user_id);
			if(data && data.sub_id){
				return send(res, 200, {
					statusCode: 200,
					subscription: {
						sub_id: result.sub_id,
						start_date: result.start_date,
						expiration_date: result.expiration_date,
						status: result.status,
						user_id: result.user_id
					},
					user: {
						id: result.user_id,
						username: result.username
					}
				});
			}else{
				send(res, 404, {
					statusCode: 404,
					statusMessage: 'Stream not found'
				});
			}
		}
	}
);