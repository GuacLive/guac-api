import bcrypt from 'bcrypt';

const randtoken = require('rand-token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(global.nconf.get('sendgrid:api_key'));

const dbInstance = global.dbInstance;
const prisma = global.prisma;
class User {
	getUserFollowingCount(from_id) {
		return new Promise((resolve, reject) => {
			prisma.follows.aggregate({
				where: {
					from_id
				},
				_count: {
				  to_id: true,
				},
			  })
			.then((result) => {
				if(result && result._count && result._count.to_id) return resolve(result._count.to_id);
				return resolve(0);
			})
			.catch(reject);
		});
	}
	getTotal(){
		return new Promise((resolve, reject) => {
			prisma.users.aggregate({
				_count: {
				  user_id: true,
				},
			  })
			.then((result) => {
				console.log('user total', result._count.user_id);
				if(result && result._count && result._count.user_id) return resolve(result._count.user_id);
				return resolve(0);
			})
			.catch(reject);
		});
	}
	getLastBan(user_id = null){
		return new Promise((resolve, reject) => {
			prisma.bans.findFirst({
				where: {
					user_id: user_id
				},
				select: {
					reason: true,
					time: true
				},
				orderBy: [{
					ban_id: 'desc'
				}]
			})
			.then(resolve)
			.catch(reject);
		});
	}
	// isPatreon can be null (show all users), true (only patreon) or false (only non-patreon)
	getUsers(isPatron = null, page = 0) {
		return new Promise((resolve, reject) => {
			var inst = dbInstance('users');
			inst = inst
			.select(
				'users.user_id',
				'users.email',
				'users.activated',
				'users.username',
				'users.type',
				'users.avatar',
				'users.banned',
				'users.patreon',
				'users.publicKey',
			)
			.orderBy('user_id', 'desc');
			if(isPatron){
				inst = inst.havingNotNull('users.patreon');
			}else if(isPatron === false){
				inst = inst.havingNull('users.patreon');
			}
			inst = inst
			.paginate({
				perPage: 25,
				currentPage: page,
				isLengthAware: true
			})
			.then((res) => {
				if(res.data){
					res.data = res.data.map((d, i) => {
						if(d.patreon){
							// yes this should be twice
							if(typeof d.patreon === 'string'){
								d.patreon = JSON.parse(d.patreon);
							}
							if(typeof d.patreon === 'string'){
								d.patreon = JSON.parse(d.patreon);
							}
						}
						return d;
					});
				}
				resolve(res);
			})
			.catch(reject);
		});
	}
	getUserById(id) {
		return new Promise((resolve, reject) => {
			const query =
				'select `users`.`user_id`,\
				\`users`.`email`,\
				`users`.`activated`,\
				\`users`.`username`,\
				IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream,\
				`users`.`type`, `users`.`avatar`,\
				`users`.`banned`,\
				`users`.`publicKey`,\
				HEX(users.color) as color,\
				`users`.`patreon` from `users`\
				left join `stream` on `users`.`user_id` = `stream`.`user_id`\
				where `users`.`user_id` = ? limit ?';
			prisma.$queryRaw(query, id, 1)
				.then(r => {
					resolve(r && r.length > 0 ? r[0] : null);
				})
				.catch(reject);
			/*prisma.users.findMany({
				where: {
					user_id: id
				},
				select: {
					user_id: true,
					email: true,
					activated: true,
					username: true,
					type: true,
					avatar: true,
					banned: true,
					publickey: true,
					patreon: true,
					color: true,
					stream: {
						select: {
							user_id: true
						},
					}
				}
			})
			.then(res => {
				res.can_stream = res.stream && res.stream.user_id;
				resolve(res);
			})
			.catch(reject);*/
			/*dbInstance('users').where({
				'users.user_id': id
			})
			.debug(true)
			.select(
				'users.user_id',
				'users.email',
				'users.activated',
				'users.username',
				dbInstance.raw('IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream'),
				'users.type',
				'users.avatar',
				'users.banned',
				'users.publicKey',
				dbInstance.raw('HEX(users.color) as color'),
				'users.patreon',
			)
			.leftJoin('stream', 'users.user_id', '=', 'stream.user_id')
			.first()
			.then(resolve)
			.catch(reject);*/
		});
	}

	getUserByEmail(email) {
		return new Promise((resolve, reject) => {
			const query =
				'select `users`.`user_id`,\
				\`users`.`email`,\
				`users`.`activated`,\
				\`users`.`username`,\
				IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream,\
				`users`.`type`, `users`.`avatar`,\
				`users`.`banned`,\
				`users`.`publicKey`,\
				HEX(users.color) as color,\
				`users`.`patreon` from `users`\
				left join `stream` on `users`.`user_id` = `stream`.`user_id`\
				where LOWER(users.email) = ? limit ?';
			prisma.$queryRaw(query, email, 1)
				.then(r => {
					resolve(r && r.length > 0 ? r[0] : null);
				})
				.catch(reject);
		});
	}

	getUserByUsername(username) {
		return new Promise((resolve, reject) => {
			const query =
				'select `users`.`user_id`,\
					\`users`.`email`,\
					`users`.`activated`,\
					\`users`.`username`,\
					IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream,\
					`users`.`type`, `users`.`avatar`,\
					`users`.`banned`,\
					`users`.`publicKey`,\
					HEX(users.color) as color,\
					`users`.`patreon` from `users`\
					left join `stream` on `users`.`user_id` = `stream`.`user_id`\
					where username = ? limit ?';
			prisma.$queryRaw(query, username, 1)
				.then(r => {
					resolve(r && r.length > 0 ? r[0] : null);
				})
				.catch(reject);
		});
	}

	getUserByUsername_lower(username) {
		return new Promise((resolve, reject) => {
			const query =
				'select `users`.`user_id`,\
					\`users`.`email`,\
					`users`.`activated`,\
					\`users`.`username`,\
					IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream,\
					`users`.`type`, `users`.`avatar`,\
					`users`.`banned`,\
					`users`.`publicKey`,\
					HEX(users.color) as color,\
					`users`.`patreon` from `users`\
					left join `stream` on `users`.`user_id` = `stream`.`user_id`\
					where LOWER(users.username) = ? limit ?';
			prisma.$queryRaw(query, username, 1)
				.then(r => {
					resolve(r && r.length > 0 ? r[0] : null);
				})
				.catch(reject);
		});
	}

	getBanned() {
		return new Promise((resolve, reject) => {
			dbInstance('users').where({
				banned: true
			})
			.debug(true)
			.select(
				'users.user_id',
				'users.email',
				'users.activated',
				'users.username',
				dbInstance.raw('IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream'),
				'users.type',
				'users.avatar',
				'users.banned',
				dbInstance.raw('HEX(users.color) as color'),
			)
			.leftJoin('stream', 'users.user_id', '=', 'stream.user_id')
			.then(resolve)
			.catch(reject);
		});
	}

	addUser(username, email, password) {
		return new Promise(async (resolve, reject) => {
			const salt = await bcrypt.genSalt(10);

			// hash the password along with our new salt
			const hashedPassword = await bcrypt.hash(password, salt);
				
			dbInstance('users')
			.insert({
				'username': username,
				'email': email,
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

	updateKeys(username, publicKey, privateKey) {
		return new Promise((resolve, reject) => {
			prisma.users.update({
				where: {
					username: username
				},
				data: {
					publicKey,
					privateKey
				}
			})
			.then(resolve)
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
			prisma.users.update({
				where: {
					user_id: user_id
				},
				data: {
					banned: false,
				}
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
				'users.email',
				'users.username',
				'users.password',
				dbInstance.raw('IF(stream.user_id IS NULL, FALSE, TRUE) as can_stream'),
				'users.type',
				'users.avatar',
				'users.banned',
				'users.activated',
			)
			.leftJoin('stream', 'users.user_id', '=', 'stream.user_id')
			.first()
			.then(async (data) => {
				if(!data) resolve(false);
				const match = await bcrypt.compare(password, data.password);
				if(match){
					resolve({
						'user_id': data.user_id,
						'email': data.email,
						'activated': data.activated,
						'username': data.username,
						'can_stream': data.can_stream,
						'type': data.type,
						'avatar': data.avatar,
						'banned': data.banned,
						'activated': data.activated,
					});
				}else{
					resolve(false);
				}
			})
			.catch(reject);
		});
	}
	getSubscriptions(user_id) {
		return new Promise((resolve, reject) => {
			dbInstance('subscriptions').where({
				'subscriptions.user_id': user_id
			})
			.where('subscriptions.expiration_date', '>', 'NOW()')
			.whereNot('subscriptions.status', 'inactive')
			.debug(true)
			.select(
				'subscriptions.id AS sub_id',
				'subscriptions.start_date',
				'subscriptions.expiration_date',
				'subscriptions.status',
				'subscriptions.user_id',
				'subscription_plans.user_id AS channel_user_id',
				'subscription_plans.stream_id AS channel_stream_id',
				'subscription_plans.email AS channel_email',
				'users.username AS channel_user_name'
			)
			.leftJoin('subscription_plans', 'subscriptions.subscription_plans_id', '=', 'subscription_plans.id')
			.leftJoin('users', 'users.user_id', '=', 'subscription_plans.user_id')
			.then(resolve)
			.catch(reject);
		});
	}
	activate(token = ''){
		return new Promise((resolve, reject) => {
			dbInstance('activation_tokens')
			.where({
				'activation_tokens.token': token
			})
			.debug(true)
			.select(
				'activation_tokens.email',
				'activation_tokens.token'
			)
			.first()
			.then(async (data) => {
				if(data && data.email){
					dbInstance('users')
					.where({
						'users.email': data.email
					})
					.debug(true)
					.select(
						'users.user_id'
					)
					.first()
					.then(async (user) => {
						if(user && user.user_id){
							await dbInstance('users')
							.update({
								'users.activated': 1
							})
							.where({
								'users.user_id': user.user_id
							})
							.then(() => {});
							
							await dbInstance('activation_tokens')
							.delete()
							.where({
								'activation_tokens.email': data.email,
								'activation_tokens.token': token
							})
							.then(() => {});
							resolve(true);
						}else{
							reject();
						}
					})
					.catch(reject);
				}else{
					reject();
				}
			})
			.catch();
		})
	}
	sendActivationToken(email = ''){
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
				console.log('hi', data);
				let token = randtoken.generate(48);
				console.log('token', token);
				// add activation token to db
				dbInstance('activation_tokens')
				.debug(true)
				.insert({
					'email': data.email,
					'user_id': data.user_id,
					'token': token
				})
				.then(() => {});
				// send e-mail
				const msg = {
					to: data.email,
					from: 'verify@guac.live',
					subject: '[guac.live] Verify your e-mail.',
					html: `<p>Follow the link underneath to verify your guac.live-account.</p><a href="https://guac.live/auth/activate?token=${token}">Activate your account</a><p><small>If you haven't registered on Guac, please ignore this e-mail.</small></p>`
				  };
				sgMail
				.send(msg)
				.then(() => {}, error => {
					console.error(error);
				
					if(error.response){
					  console.error(error.response.body)
					}
				});
			}
		});
	}
	changeColor(user_id, color) {
		return new Promise(async (resolve, reject) => {
			dbInstance('users').where({
				user_id
			})
			.update({
				color: dbInstance.raw('UNHEX(?)', [color]),
			})
			.then(resolve)
			.catch(reject);
		});
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
	updateAvatar(user_id, avatar) {
		return new Promise(async (resolve, reject) => {
			dbInstance('users').where({
				user_id
			})
			.update({
				avatar
			})
			.then(resolve)
			.catch(reject);
		});
	}
	// Updates the patreon json column in users table
	updatePatreon(user_id, patreon) {
		return new Promise(async (resolve, reject) => {
			console.log('updatePatreon');
			const user = await dbInstance('users')
				.where({
					user_id
				})
				.select('users.patreon')
				.debug(true)
				.first();

			console.log('updatePatreon 2', user.patreon);
			const updatedUser = await dbInstance('users')
				.where({
					user_id
				})
				.update({
					patreon: JSON.stringify(patreon)
				})
				.debug(true)
				.then(resolve)
				.catch(reject);
			return updatedUser;
		});
	}
	updateSubscription(data) {
		return new Promise(async (resolve, reject) => {
			dbInstance.transaction(trx => {
				trx('subscriptions')
				.where({
					'user_id': data.user_id,
					'subscription_plans_id': data.subscription_plans_id,
				})
				.then(res => {
					if(res.length === 0){
						return trx('subscriptions')
						.insert(data)
						.then(() => {
							return trx('subscriptions')
							.where({
								'user_id': data.user_id,
								'subscription_plans_id': data.subscription_plans_id,
							});
						});
					}else{
						trx('subscriptions')
						.where({
							'user_id': data.user_id,
							'subscription_plans_id': data.subscription_plans_id,
						})
						.update(data)
						.then(() => {
							return trx('subscriptions')
							.where({
								'user_id': data.user_id,
								'subscription_plans_id': data.subscription_plans_id,
							});
						});
					}
				})
			})
			.then(resolve)
			.catch(reject);
		});
	}
}
export default User;