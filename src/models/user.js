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
	sendActivationToken(email = ''){
		const mailjet = require('node-mailjet');

		const mailjetClient = mailjet.connect(
			global.nconf.get('mailjet:api_key'),
			global.nconf.get('mailjet:secret'),
		);

		dbInstance('users')
		.where({
			'users.email': email,
			'users.activated': 0
		})
		.debug(true)
		.select(
			'users.user_id',
			'users.email',
			'users.username'
		)
		.first()
		.then(async (data) => {
			if(data && data.user_id){
				const randtoken = require('rand-token');
				let token = randtoken.generate(48);
				// add activation token to db
				dbInstance('activation_tokens')
				.insert({
					'email': data.email,
					'user_id': data.user_id,
					'token': token
				});
				// send e-mail
				await mailjetClient
				.post('send', {'version': 'v3.1'})
				.request({
					'Messages': [
						{
							'From': {
								'Email': 'verify@guac.live',
								'Name': 'guac.live'
							},
							'To': [
								{
									'Email': result.email,
									'Name': result.username
								}
							],
							'Subject': '[guac.live] Verify your e-mail.',
							'HTMLPart': `<p>Follow the link underneath to verify your Guac.live-account.</p><a href="https://guac.live/auth/activate/${token}">Activate your account</a><p><small>If you haven't registered on Guac, please ignore this e-mail.</small></p>`						}
					]
				});
			}
		})
		.catch();
	}
	changePassword(user_id, password) {
		return new Promise(async (resolve, reject) => {
			const salt = await bcrypt.genSalt(10);

			// hash the password along with our new salt
			const hashedPassword = await bcrypt.hash(password, salt);

			dbInstance('users').where({
				user_id
			})
			.update({
				password: hashedPassword,
			})
			.then(resolve)
			.catch(reject);
		});
	}
}
export default User;