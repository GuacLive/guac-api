import { send } from 'micro';
import { compose } from 'micro-hoofs';

import fs from 'fs';
import streamModel from '../../models/stream';

module.exports = compose(
)(
	async (req, res) => {
		const stream = new streamModel;
		const results = await stream.getFeatured();
		const data = await Promise.all(results.map(async (item) => {
				//await stream.increaseView(item.id);
				item = await stream.getStream(item.name);
				return {
					id: item.id,
					name: item.name,
					title: item.title,
					live: parseInt(item.live, 10),
					views: parseInt(item.views, 10),
					url: `//stream.${global.nconf.get('server:domain')}/live/${item.name}/index.m3u8`,
					user: {
						id: item.user_id,
						name: item.username
					}
				};
			})
		);
		send(res, 200, {
			statusCode: 200,
			data
		});
	}
);