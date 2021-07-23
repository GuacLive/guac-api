import { send } from 'micro';
import { compose } from 'micro-hoofs';

import notificationModel from '../../models/notification';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey,
)(
	async (req, res) => {
		const notification = new notificationModel;
		const data = await notification.getNotifications(req.user.id);
		return send(res, 200, {
			statusCode: 200,
			data: data || []
		);
	}
);