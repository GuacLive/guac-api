import {send} from 'micro';
import {compose} from 'micro-hoofs';

import channelModel from '../../models/channel';
import streamModel from '../../models/stream';

import {USERNAME_REGEX} from '../../utils';

module.exports = compose(
)(
	async (req, res) => {
		if (!req.params.name || !USERNAME_REGEX.test(req.params.name)) {
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No stream name given'
			});
		}
		const channel = new channelModel;
		const stream = new streamModel;
		const streamResult = await stream.getStream(req.params.name);
		if (streamResult && streamResult.id) {
			const result = await channel.getMods(streamResult.id);
			send(res, 200, {
				statusCode: 200,
				...result
			});
		} else {
			send(res, 404, {
				statusCode: 404,
				statusMessage: 'Stream not found'
			});
		}
	}
);