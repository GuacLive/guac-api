import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';
import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const data = await json(req);

		const streamPrivate = data.private;
		if(!streamPrivate){
			send(res, 403, {
				statusCode: 403,
				statusMessage: 'No stream private flag'
			});
			return;
		}

		const stream = new streamModel;
		const result = await stream.setPrivate(req.user.id, streamPrivate);
		console.log(result);
		if(result){
			return send(res, 200, {
				statusCode: 200,
				statusMessage: 'OK'
			});
		}else{
			return send(res, 403, {
				statusCode: 403,
				statusMessage: 'Invalid stream private flag'
			});
		}
	}
);