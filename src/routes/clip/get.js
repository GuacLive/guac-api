import { send } from 'micro';
import { compose } from 'micro-hoofs';


import streamModel from '../../models/stream';


module.exports = compose(
)(
	async (req, res) => {
		const stream = new streamModel;
		const data = await stream.getClip(req.params.uuid);
		send(res, 200, {
			statusCode: 200,
			data: {
				...data,
				stream_avatar: data.stream_avatar || `${global.nconf.get('s3:cdn_endpoint')}/profile-avatars/offline-avatar.png`,
			}
		});
	}
);