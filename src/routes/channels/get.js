import { send } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

const servers = global.nconf.get('server:streaming_servers');
module.exports = compose(
)(
	async (req, res) => {
		let onlyLive = req.params.live === '1';
		const stream = new streamModel;
		const results = await stream.getChannels(onlyLive);
		send(res, 200, {
			statusCode: 200,
			data: results.map((result) => {
				if(result.live){
					result.thumbnail = `${servers['eu']}/live/${result.name}/thumbnail.png`;
					// TODO: Support more than one server
					result.servers = servers[0];
				}
				return result;
			})
		});
	}
);