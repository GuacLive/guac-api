import userModel from '../models/user';
import jwt from 'jsonwebtoken';

module.exports = fn => async (req, res) => {
	const bearerToken = req.headers.authorization;

	if(bearerToken){
		const token = req.headers.authorization.replace('Bearer ', '');
		const um = new userModel;

		return jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
			if(!err){
				if(decoded && decoded.user){
					const result = await um.getUserById(decoded.user.user_id);
					if(result){
						req.user = {
							token: token,
							id: result.user_id,
							email: result.email,
							name: result.username,
							activated: result.activated,
							can_stream: result.can_stream,
							type: result.type,
							avatar: result.avatar || `${global.nconf.get('s3:cdn_endpoint')}/profile-avatars/offline-avatar.png`,
							banned: result.banned,
							color: result.color,
							patreon: JSON.parse(result.patreon)
						};	
					}
				}
			}
			return await fn(req, res);
		});
	}else{
		return await fn(req, res);
	}
};
