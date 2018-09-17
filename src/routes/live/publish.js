import { send } from 'micro';
import { compose } from 'micro-hoofs';
import parse from 'urlencoded-body-parser';

import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const data = await parse(req);

		const streamKey = data.name;
		console.log('body', data);
		if(!streamKey){
			send(res, 403, {
				statusCode: 403,
				statusMessage: 'No stream key'
			});
			return;
		}

		const stream = new streamModel;
		const result = await stream.getStreamKey(streamKey);
		console.log(result);
		if(result){
			// Set stream as live
			await stream.setLive(result.stream_id);
			// Redirect the private stream key to the user's public stream
			res.statusCode = 304;
			res.setHeader('Location', result.name);
			res.end();
		}else{
			return send(res, 403, {
				statusCode: 403,
				statusMessage: 'Invalid stream key'
			});
		}
	}
);