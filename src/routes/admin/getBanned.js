import { send } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

module.exports = compose(
)(
	async (req, res) => {
		const user = new userModel;	
		const data = await user.getBanned();
		send(res, 200, {
			statusCode: 200,
			data
		});
	}
);