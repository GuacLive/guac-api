import { send } from 'micro';
import { compose } from 'micro-hoofs';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		send(res, 200, {
			statusCode: 200,
			user: req.user
		});
	}
);