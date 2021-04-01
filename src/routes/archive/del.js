import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';
import uploadService from '../../services/upload';

import verifyJWTKey from '../../services/verifyJWTKey';
const s3c = require('s3-commons')
module.exports = compose(
	verifyJWTKey,
	uploadService
)(
	async (req, res) => {
		const stream = new streamModel;	
		const jsonData = await json(req);
		const data = await stream.getArchive(jsonData.archive_id);
		if(data && data.archive_id && data.user_id === req.user.id){
			const { streamVodsBlobStore } = req.s3;
			console.log('streamVodsBlobStore', streamVodsBlobStore);
	
			const url = data.stream;
			if(url) {
				var id = url.split('/').filter(s => s.trim()).slice(4,-1).join('/');
				if(!id) return;
	
				const list = await s3c.deleteRecursiveVerbose(
					streamVodsBlobStore.s3,
					'cdn.guac.live/stream-vods',
					id
				);
				console.log(list);
			}
	
			await stream.deleteArchive(data.archive_id);

		}else{
			send(res, 404, {
				statusCode: 404,
				statusMessage: 'Archive not found'
			});
		}
	}
);