import { send } from 'micro';
import { compose } from 'micro-hoofs';

import { URL } from 'url';
import { parse as parseQuery } from 'querystring';

import streamModel from '../../models/stream';

import { USERNAME_REGEX } from 'utils';

module.exports = compose(
)(
	async (req, res) => {
		// Parse the request URL. Relative URLs require an origin explicitly.
		const url = new URL(req.url, 'https://' + req.headers.host);
		// Parse the URL query. The leading '?' has to be removed before this.
		const query = parseQuery(url.search.substr(1));
		if(!req.params.name || !USERNAME_REGEX.test(req.params.name)){
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No stream name given'
			});
		}
		const stream = new streamModel;
		const result = await stream.getClips(req.params.name, parseInt(query.page || 1, 10));
		send(res, 200, {
			statusCode: 200,
			...result
		});
	}
);