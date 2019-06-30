const dbInstance = global.dbInstance;
class Device {
	tokenExists(token) {
		return new Promise((resolve, reject) => {
			dbInstance('devices')
			.where({
				'token': token
			})
			.limit(1)
			.debug(true)
			.then((data) => {
				resolve(data.length > 0);
			})
			.catch(reject);
		});
	}
	addToken(userId, token, deviceType = 'web') {
		return new Promise((resolve, reject) => {
			dbInstance('devices')
			.insert({
				'user_id': userId,
				'token': token,
				'type': deviceType
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
}
export default Device;