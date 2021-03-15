import { send } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const stream = new streamModel;	
		const data = await stream.getArchive(req.params.id);
		if(data && data.archive_id){
			send(res, 200, {
				statusCode: 200,
				data
			});
		}else{
			send(res, 404, {
				statusCode: 404,
				statusMessage: 'Archive not found'
			});
		}
	}
);