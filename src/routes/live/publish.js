import {send} from 'micro';
import {compose} from 'micro-hoofs';
import parse from 'urlencoded-body-parser';
import chunk from 'lodash.chunk';

import fetch from 'node-fetch';

import streamModel from '../../models/stream';
import deviceModel from '../../models/device';

module.exports = compose(
)(
	async (req, res) => {
		const data = await parse(req);

		const streamKey = data.name;
		console.log('body', data);
		if(!streamKey){
			send(res, 403, {
				statusCode: 403,
				statusMessage: 'No stream key'
			});
			return;
		}

		const stream = new streamModel;
		const device = new deviceModel;
		const result = await stream.isValidStreamKey(streamKey);
		console.log(result);
		if(result){
			// Set stream as live
			await stream.setLive(result.stream_id);

			// Check if firebase api key is set
			if(global.nconf.get('firebase:api_key')){
				// The person is going live, send notifications
				const followTokens = await device.getFollowTokens(result.user_id);
				const chunkedTokens = chunk(followTokens, 100);
				const firebaseMessage = {
					priority: 'high',
					notification: {
						title: `${result.name} went live`,
						body: `${result.name} is now live on guac.live`,
					},
					data: {
						username: result.name
					}
				};
				console.log(chunkedTokens);
				chunkedTokens.forEach((registration_ids) => {
					fetch('https://fcm.googleapis.com/fcm/send', {
						'method': 'POST',
						'headers': {
							'Authorization': 'key=' + global.nconf.get('firebase:api_key'),
							'Content-Type': 'application/json'
						},
						'body': JSON.stringify({
							...firebaseMessage,
							registration_ids
						})
					})
					.then(response => {
						console.log('FCM response: ', response);
					})
					.catch(error => {
						console.log('FCM error: ', error);
					});
				});
			}

			// Redirect the private stream key to the user's public stream
			res.statusCode = 304;
			res.setHeader('Location', result.name);
			res.end();
		}else{
			return send(res, 403, {
				statusCode: 403,
				statusMessage: 'Invalid stream key'
			});
		}
	}
);