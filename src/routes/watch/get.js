import { send } from 'micro';
import { compose, parseJSONInput } from 'micro-hoofs';

import fs from 'fs';
import streamModel from '../../models/stream';

const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

module.exports = compose(
)(
	async (req, res) => {
		if(!req.params.name || !USERNAME_REGEX.test(req.params.name)){
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No stream name given'
			});
		}
		const stream = new streamModel;
		const result = await stream.getStream(req.params.name);
		console.log(req.params, result);
		if(result && result.id){
			await stream.increaseView(result.id);
			send(res, 200, {
				statusCode: 200,
				data: {
					id: result.id,
					name: result.name,
					title: result.title,
					live: parseInt(result.live, 10),
					views: parseInt(result.views, 10),
					category_id: result.category_id,
					category_name: result.category_name,
					urls: {
						hls: `/live/${result.name}/index.m3u8`,
						flv: `/live/${result.name}/index.flv`
					},
					servers: global.nconf.get('server:streaming_servers'),
					user: {
						id: result.user_id,
						name: result.username
					}
				}
			});
		}else{
			send(res, 404, {
				statusCode: 404,
				statusMessage: 'Stream not found'
			});
		}
	}
);