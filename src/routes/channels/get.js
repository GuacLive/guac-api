import { send } from 'micro';
import { compose } from 'micro-hoofs';

import fs from 'fs';
import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const stream = new streamModel;
		const results = await stream.getChannels();
		send(res, 200, {
			statusCode: 200,
			data: results
		});
	}
);