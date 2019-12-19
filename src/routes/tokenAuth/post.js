import { send } from 'micro';
import { compose } from 'micro-hoofs';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		send(res, 200, {
			statusCode: 200,
			token: req.user.token,
			user: {
				id: req.user.id,
				name: req.user.name,
				can_stream: req.user.can_stream,
				type: req.user.type,
				avatar: req.user.avatar || `//${global.nconf.get('server:domain')}/avatars/unknown.png`,
				banned: req.user.banned,
			}
		});
	}
);