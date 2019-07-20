import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

import jwt from 'jsonwebtoken';

module.exports = compose(
)(
	async (req, res) => {
		const um = new userModel;
		const data = await json(req);
		var user = await um.checkUser(data.username, data.password);
		if(user){
			var jwtToken = jwt.sign({
				user
			}, process.env.JWT_SECRET, {
				algorithm: 'HS256'
			});

			send(res, 200, {
				statusCode: 200,
				jwtToken,
				user
			});
		}else{
			send(res, 401, {
				statusCode: 401,
				error: 'Invalid credentials'
			});
		}
	}
);