import { send } from 'micro';
import { compose } from 'micro-hoofs';


import streamModel from '../../models/stream';


module.exports = compose(
)(
	async (req, res) => {
		const stream = new streamModel;
		const result = await stream.getClip(req.params.uuid);
		send(res, 200, {
			statusCode: 200,
			...result
		});
	}
);