import { send } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

import verifyJWTKey from '../../services/verifyJWTKey';
module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const stream = new streamModel;
		const result = await stream.getStreamKey(req.user.id);
		const configResult = await stream.getStreamConfig(req.user.name);
		send(res, 200, {
			statusCode: 200,
			key: result && result.stream_key,
			title: result && result.title,
			banner: result && result.banner,
			private: result && result.private,
			archive: configResult && !!configResult.archive,
		});
	}
);