import { send } from 'micro';
import { compose } from 'micro-hoofs';
import parse from 'urlencoded-body-parser';

import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const data = await parse(req);

		const streamKey = data.name;
		
		if(!streamKey){
			send(res, 403, {
				statusCode: 403,
				statusMessage: 'No stream key'
			});
			return;
		}

		const stream = new streamModel;
		const result = await stream.getStreamKey(streamKey);
		if(result){
			await stream.setInactive(result.stream_id);
			return send(res, 200);
		}else{
			return send(res, 403, {
				statusCode: 403,
				statusMessage: 'Invalid stream key'
			});
		}
	}
);