import { send } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

import verifySecretKey from '../../services/verifySecretKey';
const DEFAULT_BITRATE_LIMIT = 8000;
module.exports = compose(
	verifySecretKey
)(
	async (req, res) => {
		const stream = new streamModel;
		const result = await stream.getStreamConfig(req.params.name);
		send(res, 200, {
			statusCode: 200,
			archive: result ? !!result.archive : false,
			bitrateLimit: result && result.bitrateLimit ? result.bitrateLimit : DEFAULT_BITRATE_LIMIT,
		});
	}
);