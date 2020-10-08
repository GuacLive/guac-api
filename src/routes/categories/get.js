import { send } from 'micro';
import { compose } from 'micro-hoofs';

import { parse } from 'url';

import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const { query } = await parse(req.url, true)
		const stream = new streamModel;
		const result = await stream.getCategories(parseInt(query.page || 1, 10));
		send(res, 200, {
			statusCode: 200,
			...result
		});
	}
);