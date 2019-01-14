import { send } from 'micro';
import url from 'url';

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

	if(process.env.API_SECRET !== token){
		return send(res, 401, {
			statusCode: 401,
			statusMessage: 'Invalid secret key'
		});
	}
	return await fn(req, res);
};
