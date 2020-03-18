import {send} from 'micro';
import {compose} from 'micro-hoofs';

import fetch from 'node-fetch';

import AbortController from 'abort-controller';

const controller = new AbortController();
const timeout = setTimeout(() => {
	controller.abort();
}, 150);

const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
module.exports = compose(
)(
	async (req, res) => {
		let data = [];
		if(req.params && req.params.name && USERNAME_REGEX.test(req.params.name)){
			fetch(`${global.nconf.get('server:chat_url')}/messages/${req.params.name}`,
				{
					method: 'get',
					headers: {
						'Content-Type': 'application/json'
					},
					signal: controller.signal
				}
			)
			.then(res => res.json())
			.then(
				data => {
					return send(res, 200, {
						statusCode: 200,
						data
					});
				},
				err => {
					if(err.name === 'AbortError'){
						return send(res, 500, {
							statusCode: 500,
						});
					}
				}
			)
			.finally(() => {
				clearTimeout(timeout);
			});
		}else{
			return send(res, 200, {
				statusCode: 200,
			});
		};
	}
);