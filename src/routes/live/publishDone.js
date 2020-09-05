import { send } from 'micro';
import { compose } from 'micro-hoofs';
import parse from 'urlencoded-body-parser';

import fetch from 'node-fetch';
import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const data = await parse(req);

		const streamKey = data.name;
		
		if(!streamKey){
			send(res, 403, {
				statusCode: 403,
				statusMessage: 'No stream key'
			});
			return;
		}

		const stream = new streamModel;
		const result = await stream.isValidStreamKey(streamKey);
		if(result){
			await stream.setInactive(result.stream_id);
			// Send live event to those with channel websocket connection open
			if(global.nconf.get('server:viewer_api_url')) {
				fetch(`${global.nconf.get('server:viewer_api_url')}/admin`, {
					'method': 'POST',
					'headers': {
						'Authorization': global.nconf.get('server:viewer_api_key'),
						'Content-Type': 'application/json'
					},
					'body': JSON.stringify({
						'action': 'live',
						'name': result.name,
						'live': false
					})
				})
				.then(response => {
				})
				.catch(error => {
				});
			}
			return send(res, 200);
		}else{
			return send(res, 403, {
				statusCode: 403,
				statusMessage: 'Invalid stream key'
			});
		}
	}
);