const dbInstance = global.dbInstance;
const prisma = global.prisma;
class Device {
	getFollowTokens(to_id) {
		return new Promise((resolve, reject) => {
			dbInstance('follows')
			.distinct()
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
			prisma.devices.findUnique({
				where: {
					'token': token
				},
			})
			.then(resolve)
			.then((data) => {
				resolve(!!data);
			})
			.catch(reject);
		});
	}
	addToken(userId, token, deviceType = 'web') {
		return new Promise((resolve, reject) => {
			prisma.devices.create({
				data: {
					'user_id': userId,
					'token': token,
					'type': deviceType
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
}
export default Device;