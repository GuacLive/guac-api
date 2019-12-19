import bcrypt from 'bcrypt';
const dbInstance = global.dbInstance;
class User {
	getUserById(id) {
		return new Promise((resolve, reject) => {
			dbInstance('users').where({
				'users.user_id': id
			})
			.debug(true)
			.select(
				'users.user_id',
				'users.username',
				dbInstance.raw('IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream'),
				'users.type',
				'users.avatar',
				'users.banned',
			)
			.leftJoin('stream', 'users.user_id', '=', 'stream.user_id')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}

	getUserByUsername(username) {
		return new Promise((resolve, reject) => {
			dbInstance('users').where({
				'users.username': username
			})
			.debug(true)
			.select(
				'users.user_id',
				'users.username',
				dbInstance.raw('IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream'),
				'users.type',
				'users.avatar',
				'users.banned',
			)
			.leftJoin('stream', 'users.user_id', '=', 'stream.user_id')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}

	getUserByUsername_lower(username) {
		return new Promise((resolve, reject) => {
			dbInstance('users')
			.where(
			  dbInstance.raw('LOWER(users.username) = ?', [username])
			)
			.debug(true)
			.select(
				'users.user_id',
				'users.username',
				dbInstance.raw('IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream'),
				'users.type',
				'users.avatar',
				'users.banned',
			)
			.leftJoin('stream', 'users.user_id', '=', 'stream.user_id')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}

	addUser(username, password) {
		return new Promise(async (resolve, reject) => {
			const salt = await bcrypt.genSalt(10);

			// hash the password along with our new salt
			const hashedPassword = await bcrypt.hash(password, salt);
				
			dbInstance('users')
			.insert({
				'username': username,
				'password': hashedPassword,
				'type': 'user'
			})
			.debug(true)
			.then(async (data) => {
				if(!data) resolve(false);
				resolve(await this.getUserByUsername(username));
			})
			.catch(reject);
		});
	}

	ban(user_id, reason) {
		return new Promise((resolve, reject) => {
			dbInstance('users').where({
				user_id
			})
			.update({
				banned: true,
			})
			.then(() => {
				dbInstance('bans')
				.insert({
					'user_id': user_id,
					'reason': reason,
				})
				.debug(true)
				.then(async (data) => {
					if(!data) resolve(false);
					resolve(await this.getUserById(user_id));
				})
				.then(resolve)
				.catch(reject);
			})
			.catch(reject);
		});
	}

	unban(user_id) {
		return new Promise((resolve, reject) => {
			dbInstance('users').where({
				user_id
			})
			.update({
				banned: false,
			})
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
			.select(
				'users.user_id',
				'users.username',
				'users.password',
				dbInstance.raw('IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream'),
				'users.type',
				'users.avatar',
				'users.banned',
			)
			.leftJoin('stream', 'users.user_id', '=', 'stream.user_id')
			.first()
			.then(async (data) => {
				if(!data) resolve(false);
				const match = await bcrypt.compare(password, data.password);
				if(match){
					resolve({
						'user_id': data.user_id,
						'username': data.username,
						'can_stream': data.can_stream,
						'type': data.type,
						'avatar': data.avatar,
						'banned': data.banned
					});
				}else{
					resolve(false);
				}
			})
			.catch(reject);
		});
	}
}
export default User;