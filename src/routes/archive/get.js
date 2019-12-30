import { send } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const stream = new streamModel;	
		const streamResult = await stream.getStream(req.params.name);
		console.log(streamResult);
		if(streamResult && streamResult.user_id){
			const data = await stream.getArchives(streamResult.user_id);
			send(res, 200, {
				statusCode: 200,
				data
			});
		}else{
			send(res, 404, {
				statusCode: 404,
				statusMessage: 'Stream not found'
			});
		}
	}
);