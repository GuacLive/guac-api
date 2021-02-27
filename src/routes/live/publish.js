import {send} from 'micro';
import {compose} from 'micro-hoofs';
import parse from 'urlencoded-body-parser';
import chunk from 'lodash.chunk';

const { Webhook, MessageBuilder } = require('discord-webhook-node');

import fetch from 'node-fetch';

import verifySecretKey from '../../services/verifySecretKey';

import streamModel from '../../models/stream';
import deviceModel from '../../models/device';

module.exports = compose(
	verifySecretKey
)(
	async (req, res) => {
		const data = await parse(req);

		console.log('body', data);
		
		const streamServer = data.streamServer;
		if(!streamServer){
			send(res, 400, {
				statusCode: 400,
				statusMessage: 'No stream server'
			});
			return;
		}

		const streamKey = data.name;
		if(!streamKey){
			send(res, 403, {
				statusCode: 403,
				statusMessage: 'No stream key'
			});
			return;
		}

		const tcUrl = data.tcUrl;
	
		if(!tcUrl){
			send(res, 403, {
				statusCode: 403,
				statusMessage: 'No tcUrl'
			});
			return;
		}

		const stream = new streamModel;
		const device = new deviceModel;
		const result = await stream.isValidStreamKey(streamKey);
		var followTokens = [];
		console.log(result);
		if(result && tcUrl.toLowerCase() === `/live/${result.name}`){
			const hooks = await stream.getWebHooks(result.user_id);
			if(result.banned){
				return send(res, 403, {
					statusCode: 403,
					statusMessage: 'User has been banned'
				});
			}
			// Set stream as live
			await stream.setLive(result.stream_id);
			// Set stream server
			// TODO: Verify against a list of valid stream-servers (create a stream-server orchestration service?)
			await stream.setServer(result.stream_id, `//${streamServer}`);
			// Set stream time
			await stream.updateTime(result.stream_id);

			// Check if firebase api key is set
			if(global.nconf.get('firebase:api_key')){
				// The person is going live, send notifications
				try{
					followTokens = await device.getFollowTokens(result.user_id);
				}catch(e){
					followTokens = [];
				}
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

			// If stream has webhooks, run them
			if(hooks){
				hooks.forEach((hook) => {
					const Hook = new Webhook(hook.url);

					const msg = new MessageBuilder()
						.setTitle(result.title)
						.setName(result.name)
						.setDescription('Just went live on guac')
						.setUrl('https://guac.live/c/' + result.name)
						.setImage(result.thumbnail)
						.setTime();
					
					Hook.send(msg);
				});
			}

			// Send live event to those with channel websocket connection open
			if(global.nconf.get('server:viewer_api_url')){
				fetch(`${global.nconf.get('server:viewer_api_url')}/admin`, {
					'method': 'POST',
					'headers': {
						'Authorization': global.nconf.get('server:viewer_api_key'),
						'Content-Type': 'application/json'
					},
					'body': JSON.stringify({
						'action': 'live',
						'name': result.name,
						'live': true
					})
				})
				.then(response => {
				})
				.catch(error => {
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