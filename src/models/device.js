const dbInstance = global.dbInstance;
class Device {
	getFollowTokens(to_id) {
		return new Promise((resolve, reject) => {
			dbInstance('follows')
			.where({
				'to_id': to_id
			})
			.select('devices.token')
			.join('devices', 'devices.user_id', '=', 'follows.to_id')
			.debug(true)
			.then((data, err) => {
				if(data){
					const data2 = data.map(row => {
						return row.token;
					});
					resolve(data2);
				}else{
					resolve([]);
				}
			})
			.catch(reject);
		});
	}
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