import { send } from 'micro';
import { compose } from 'micro-hoofs';

import { parse } from 'url';

import streamModel from '../../models/stream';

const servers = global.nconf.get('server:streaming_servers');
module.exports = compose(
)(
	async (req, res) => {
		const { query } = await parse(req.url, true)
		const stream = new streamModel;
		const results = await stream.getChannels(query);
		send(res, 200, {
			statusCode: 200,
			data: results.map((result) => {
				if(result.live){
					result.thumbnail = `${result.streamServer}/live/${result.name}/thumbnail.jpg`;
					// TODO: Support more than one server
					result.servers = servers[0];
				}
				return result;
			})
		});
	}
);