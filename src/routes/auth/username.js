import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

module.exports = compose(
)(
	async (req, res) => {
		const um = new userModel;
		const username = req.params.username;
		var user = await um.getUserByUsername_lower(username);
		if(user){
			send(res, 200, {
				statusCode: 200,
				user: {
					name: user.username,
					banned: user.banned,
					activated: user.activated,
					canStream: user.can_stream
				}
			});
		}else{
			send(res, 404, {
				statusCode: 404,
				error: 'User not found'
			});
		}
	}
);