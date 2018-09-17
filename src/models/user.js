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
				'user_id': id
			})
			.debug(true)
			.select('users.user_id', 'users.username', 'users.password')
			.first()
			.then(async (data) => {
				const match = await bcrypt.compare(password, data.password);

				if(match){
					resolve({
						'user_id': data.user_id,
						'username': data.username
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