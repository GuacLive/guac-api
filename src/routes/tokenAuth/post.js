import { send } from 'micro';
import { compose, parseJSONINput } from 'micro-hoofs';

import fs from 'fs';
import userModel from '../../models/user';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const user = new userModel;
		send(res, 200, req.user);
	}
);