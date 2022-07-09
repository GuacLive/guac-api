import { send } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const stream = new streamModel;	
		const data = await stream.getArchive(req.params.id);
		if(data && data.archive_id){
			send(res, 200, {
				statusCode: 200,
				data: {
					archive_id: data.archive_id,
					duration: data.duration,
					stream: data.stream,
					thumbnail: data.thumbnail,
					time: data.time, 
					streamName: data.streamName,
					streamType: data.streamType,
					user: {
						id: data.user_id,
						name: data.name,
						type: data.type,
						avatar: data.avatar || `${global.nconf.get('s3:cdn_endpoint')}/profile-avatars/offline-avatar.png`,
						banned: data.banned
					},
				}
			});
		}else{
			send(res, 404, {
				statusCode: 404,
				statusMessage: 'Archive not found'
			});
		}
	}
);