import {send} from 'micro';
import {compose} from 'micro-hoofs';

import fetch from 'node-fetch';

import AbortController from 'abort-controller';

const controller = new AbortController();
const timeout = setTimeout(() => {
	controller.abort();
}, 15000);

const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
module.exports = compose(
)(
	async (req, res) => {
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
					return send(res, 500, {
						statusCode: 500,
						statusMessage: err.name === 'AbortError' ? 'Timed out' : null
					});
				}
			)
			.finally(() => {
				clearTimeout(timeout);
			});
		}
		return send(res, 200, {
			statusCode: 200,
		});
	}
);