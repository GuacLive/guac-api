import { send } from 'micro';
import { compose } from 'micro-hoofs';

import fs from 'fs';
import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		send(res, 200, {
			statusCode: 200,
			regions: {
				eu: [
					'stream'
				]
			}
		});
	}
);