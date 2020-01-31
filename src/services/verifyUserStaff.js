import { send } from 'micro';
import url from 'url';

module.exports = fn => async (req, res) => {
    if(!req.user){   
        return send(res, 401, {
            statusCode: 401,
            statusMessage: 'Missing user'
        });
    }
    if(req.user.type !== 'staff' && req.user.type !== 'admin'){
        return send(res, 403, {
            statusCode: 403,
            statusMessage: 'Unauthorized'
        });
    }
	return await fn(req, res);
};