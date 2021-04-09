import {send, json} from 'micro';
import {compose} from 'micro-hoofs';

import streamModel from '../../models/stream';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const stream = new streamModel;
		const jsonData = await json(req);
		if (req.user && req.user.name) {
			if(req.params.name){
				const result = await stream.getStream(req.params.name);
				if(result.live && parseInt(result.live, 10) == 0){
					return send(res, 400, {
						statusCode: 400,
						statusMessage: 'Channel is not live'
					});
				}
				const auth = Buffer.from(`${global.nconf.get('nms:user')}:${global.nconf.get('nms:password')}`)
					.toString('base64');
				const nms = await fetch(result.streamServer + '/clip', {
					'method': 'POST',
					'headers': {
						'Authorization': `Basic ${auth}`,
						'Content-Type': 'application/json'
					},
					'body': JSON.stringify({
						'length': 60, // TODO: Make length customizable
						'name': result.name
					})
				});
				const data = await nms.json();
				if(data){
					await stream.createClip(result.id, `Clipped by ${req.user.name}`, req.user.id, data.url);
					return send(res, 200, {
						statusCode: 200,
					});
				}else{
					return send(res, 500, {
						statusCode: 500,
						statusMessage: 'Could not create clip'
					});
				}
			}else{
				return send(res, 401, {
					statusCode: 401,
					statusMessage: 'Channel not found'
				});
			}

		} else {
			return send(res, 401, {
				statusCode: 401,
				statusMessage: 'You are not logged in'
			});
		}
	}
);