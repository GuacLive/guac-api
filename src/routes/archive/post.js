import { send,json } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

import verifySecretKey from '../../services/verifySecretKey';

module.exports = compose(
	verifySecretKey
)(
	async (req, res) => {

		/*
		streamName,
		duration,
		id,
		thumbnail: encodeURIComponent(`https://${config.s3.publishUrl}/${key}thumbnail.jpg`),
		stream: encodeURIComponent(`https://${config.s3.publishUrl}/${key}index.m3u8`)
		*/
  
		const stream = new streamModel;
		const jsonData = await json(req);
		const result = await stream.getStream(jsonData.streamName);
		if(
			jsonData
			&& jsonData.streamName
			&& jsonData.stream
			&& result
		){
			await channel.createArchive(
				result.user_id,
				jsonData.streamName,
				jsonData.duration,
				jsonData.random,
				jsonData.thumbnail,
				jsonData.stream
			);
		}else{
			// ???
			return send(res, 401, {
				statusCode: 401,
				statusMessage: 'Channel not found'
			});
		}
	}
);