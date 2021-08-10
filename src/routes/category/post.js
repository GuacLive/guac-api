import { send,json } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const stream = new streamModel;
		const jsonData = await json(req);
		let data = {};
		if(typeof jsonData.category_id !== 'undefined'){
			data = await stream.getCategory(Number(jsonData.category_id));
		}else{
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No category_id given'
			});
		}

		send(res, 200, {
			statusCode: 200,
			data
		});
	}
);