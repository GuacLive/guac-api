import bcrypt from 'bcrypt';
const dbInstance = global.dbInstance;
class User {
	getUserById(id) {
		return new Promise((resolve, reject) => {
			dbInstance('users').where({
				'user_id': id
			})
			.debug(true)
			.select('users.user_id', 'users.username')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}

	checkUser(username, password) {
		return new Promise((resolve, reject) => {
			dbInstance('users').where({
				'username': username
			})
			.debug(true)
			.select('users.user_id', 'users.username', 'users.password, IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream')
			.leftJoin('stream', 'ON (users.user_id = stream.user_id)')
			.first()
			.then(async (data) => {
				if(!data) resolve(false);
				const match = await bcrypt.compare(password, data.password);

				if(match){
					resolve({
						'user_id': data.user_id,
						'username': data.username,
						'can_stream': data.can_stream
					});
				}else{
					resolve(false);
				}
				console.log(data)
			})
			.catch(reject);
		});
	}
}
export default User;