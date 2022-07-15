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
			await stream.addArchive(
				result.user_id,
				result.title,
				jsonData.duration,
				jsonData.random,
				decodeURIComponent(jsonData.thumbnail),
				decodeURIComponent(jsonData.stream),
				result.private
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