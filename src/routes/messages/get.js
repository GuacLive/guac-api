import {send} from 'micro';
import {compose} from 'micro-hoofs';

import fetch from 'node-fetch';

import AbortController from 'abort-controller';

import { USERNAME_REGEX } from '../../utils';
module.exports = compose(
)(
	async (req, res) => {
		console.log('messages', req.params);
		if(req.params && req.params.name && USERNAME_REGEX.test(req.params.name)){
			let api = await fetch(`${global.nconf.get('server:chat_url')}/messages/${req.params.name}`,
				{
					method: 'get',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			try{
				const data = await api.json();
				return send(res, 200, {
						statusCode: 200,
						data
				});
			}catch(e){
				return send(res, 200, {
						statusCode: 200,
						data: []
				});
			}
		}else{
			return send(res, 200, {
				statusCode: 200,
			});
		};
	}
);