import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';
import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const data = await json(req);

		const streamTitle = data.title;
		if(!streamTitle){
			send(res, 403, {
				statusCode: 403,
				statusMessage: 'No stream title'
			});
			return;
		}

		if(streamTitle && streamTitle.length > 255){
			send(res, 403, {
				statusCode: 403,
				statusMessage: 'Stream title too long'
			});
			return;

		}

		const stream = new streamModel;
		const result = await stream.setTitle(req.user.id, streamTitle);
		console.log(result);
		if(result){
			return send(res, 200, {
				statusCode: 200,
				statusMessage: 'OK'
			});
		}else{
			return send(res, 403, {
				statusCode: 403,
				statusMessage: 'Invalid stream title'
			});
		}
	}
);