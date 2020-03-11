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
	const um = new userModel;

	try {
		return jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
			if (err) {
				return send(res, 401, {
					statusCode: 401,
					statusMessage: 'Invalid JWT key'
				});
			}

			if(!decoded || !decoded.user) throw Error('No user data in decoded JWT');
			const result = await um.getUserById(decoded.user.user_id);
			if(!result){
				return send(res, 401, {
					statusCode: 401,
					statusMessage: 'User not found'
				});
			}
			req.user = {
				token: token,
				id: result.user_id,
				name: result.username,
				activated: result.activated,
				can_stream: result.can_stream,
				type: result.type,
				avatar: result.avatar || `//api.${global.nconf.get('server:domain')}/avatars/unknown.png`,
				banned: result.banned,
				color: result.color,
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
