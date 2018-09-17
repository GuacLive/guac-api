import { send } from 'micro';
import { compose, parseJSONINput } from 'micro-hoofs';

import fs from 'fs';
import userModel from '../../models/user';

module.exports = compose(
	parseJSONINput
)(
	async (req, res) => {
		const um = new userModel;
		var user = await um.checkUser(req.params.username, req.params.password);
		if(user){
			var jwtToken = jwt.sign({
				user
			}, global.nconf.get('server:secret'), {
				algorithm: 'HS256'
			});

			send(res, 200, {
				statusCode: 200,
				jwtToken
			});
		}
	}
);