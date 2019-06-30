import { send,json } from 'micro';
import { compose } from 'micro-hoofs';

import deviceModel from '../../models/device';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const device = new deviceModel;
		const jsonData = await json(req);
		if(jsonData && jsonData.fcmToken){
			let userId = req.user.id;
			let fcmToken = jsonData.fcmToken;
			let deviceType = jsonData.deviceType || 'web';
			// If FCM token is already in database, error out
			if(await device.tokenExists(fcmToken)){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'FCM token already exists'
				});
			}
			await device.addToken(
				userId,
				fcmToken,
				deviceType,
			);
			return send(res, 200, {
				statusCode: 200,
			});
		}else{
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No FCM token provided'
			});
		}
	}
);