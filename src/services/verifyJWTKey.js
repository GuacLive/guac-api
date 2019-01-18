import { send } from 'micro';
import url from 'url';
import userModel from '../models/user';
import jwt from 'jsonwebtoken';

module.exports = fn => async (req, res) => {
	const bearerToken = req.headers.authorization;
	const pathname = url.parse(req.url).pathname;

	if(!bearerToken){
		send(res, 401, {
			statusCode: 401,
			statusMessage: 'Missing Authorization header'
		});
		return;
	}

	const token = req.headers.authorization.replace('Bearer ', '');

	try {
		return jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
			if (err) {
				return send(res, 401, {
					statusCode: 401,
					statusMessage: 'Invalid JWT key'
				});
			}

			const userId = decoded.sub;

			const result = await userModel.findById(userId);
			if(!result){
				return send(res, 401, {
					statusCode: 401,
					statusMessage: 'User not found'
				});
			}
			req.user = {
				token: token,
				id: result.user_id,
				name: result.username
			};
			return await fn(req, res);
		});
	} catch (err) {
		return send(res, 401, {
			statusCode: 401,
			statusMessage: 'Invalid JWT key'
		});
	}
};
