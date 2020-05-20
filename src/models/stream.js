const dbInstance = global.dbInstance;
class Stream {
	getArchives(user_id) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_archives')
			.where({
				'stream_archives.user_id': user_id
			})
			.select('stream_archives.*', 'u1.username')
			.orderBy('archive_id', 'desc')
			.join('users as u1', 'u1.user_id', '=', 'stream_archives.user_id')
			.join('stream', 'stream.user_id', '=', 'stream_archives.user_id')
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getPanels(user_id) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_panels')
			.where({
				'stream_panels.user_id': user_id
			})
			.select('stream_panels.*', 'u1.username')
			.orderBy('panel_id', 'desc')
			.join('users as u1', 'u1.user_id', '=', 'stream_panels.user_id')
			.join('stream', 'stream.user_id', '=', 'stream_panels.user_id')
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getPanel(panel_id) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_panels')
			.where({
				'stream_panels.panel_id': panel_id
			})
			.select('stream_panels.*', 'u1.username')
			.orderBy('panel_id', 'desc')
			.join('users as u1', 'u1.user_id', '=', 'stream_panels.user_id')
			.join('stream', 'stream.user_id', '=', 'stream_panels.user_id')
			.debug(true)
			.first()
			.then(resolve)
			.catch(reject);
		});
	}
	// getCategories should be a seperate model mayhaps?
	getCategories() {
		return new Promise((resolve, reject) => {
			dbInstance('categories')
			.orderBy('category_id', 'asc')
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getChannels(only = []) {
		let where = {
			'private': 0
		};
		if(only.live) where.live = Boolean(+only.live);
		if(only.category) where.category_id = parseInt(only.category, 10);
		return new Promise((resolve, reject) => {
			dbInstance('stream')
			.select('stream.*', 'u1.user_id', 'u1.username AS name',
				'c1.category_id AS category_id', 'c1.name AS category_name', 'u1.type')
			.orderBy('id', 'desc')
			.where(where)
			.join('users as u1', 'u1.user_id', '=', 'stream.user_id')
			.join('categories as c1', 'c1.category_id', '=', 'stream.category')
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getFeatured() {
		return new Promise((resolve, reject) => {
			dbInstance('stream')
			.select(['id', 'u1.username AS name', 'u1.type', 'u1.avatar', 'u1.banned'])
			.where({
				'live': 1,
				'private': 0
			})
			.debug(true)
			.join('users as u1', 'u1.user_id', '=', 'stream.user_id')
			.limit(5)
			.orderBy('views', 'desc')
			.then(resolve)
			.catch(reject);
		});
	}
	getSubscriptionToChannel(user_id, stream_id) {
		return new Promise((resolve, reject) => {
			dbInstance('subscriptions').where({
				'subscriptions.user_id': user_id,
				'subscription_plans.stream_id': stream_id
			})
			.where('subscriptions.expiration_date', '>', 'NOW()')
			.whereNot('subscription.status', 'inactive')
			.debug(true)
			.select(
				'subscriptions.id AS sub_id',
				'subscriptions.start_date',
				'subscriptions.expiration_date',
				'subscriptions.status',
				'subscriptions.user_id',
				'users.id AS user_id',
				'users.username',
				'stream.*'
			)
			.leftJoin('subscription_plans', 'subscriptions.subscription_plans_id', '=', 'subscription_plans.id')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}
	getPlan(plan_id, email) {
		return new Promise((resolve, reject) => {
			dbInstance('subscription_plans').where({
				'plan_id': plan_id,
				'subscription_plans.email': email
			})
			.debug(true)
			.select('subscription_plans.*')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}
	getPlans(name) {
		return new Promise((resolve, reject) => {
			dbInstance('subscription_plans').where({
				'u1.username': name
			})
			.debug(true)
			.join('users as u1', 'u1.user_id', '=', 'subscription_plans.user_id')
			.select('subscription_plans.*', 'u1.user_id', 'u1.username AS name')
			.then(resolve)
			.catch(reject);
		});
	}
	getStream(name) {
		return new Promise((resolve, reject) => {
			dbInstance('stream').where({
				'u1.username': name
			})
			.debug(true)
			.join('users as u1', 'u1.user_id', '=', 'stream.user_id')
			.leftJoin('channel_mods as m1', 'm1.room_id', '=', 'stream.id')
			.join('categories as c1', 'c1.category_id', '=', 'stream.category')
			.select('stream.*', 'stream.type AS stream_type', 'u1.user_id', 'u1.username AS name',
				'c1.category_id AS category_id', 'c1.name AS category_name', 'u1.type', 'u1.avatar', 'u1.banned')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}
	getStreamFollowCount(to_id) {
		return new Promise((resolve, reject) => {
			dbInstance('follows').where({
				to_id
			})
			.count('to_id AS count')
			.first()
			.then((result) => {
				if(result && result.count) return resolve(result.count);
				return resolve(0);
			})
			.catch(reject);
		});
	}
	getStreamKey(user_id) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_keys').where({
				's1.user_id': user_id
			})
			.join('stream as s1', 's1.id', '=', 'stream_keys.id')
			.join('users as u1', 'u1.user_id', '=', 's1.user_id')
			.debug(true)
			.select('stream_keys.*', 's1.*', 'u1.username AS name')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}
	isValidStreamKey(streamKey) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_keys').where({
				stream_key: streamKey
			})
			.join('stream as s1', 's1.id', '=', 'stream_keys.id')
			.join('users as u1', 'u1.user_id', '=', 's1.user_id')
			.debug(true)
			.select('stream_keys.*', 's1.*', 'u1.username AS name', 'u1.banned')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}
	getWebHooks(user_id) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_webhooks').where({
				'stream_webhooks.user_id': user_id,
			})
			.join('users as u1', 'u1.user_id', '=', 'stream_webhooks.user_id')
			.debug(true)
			.select('stream_webhooks.*', 'u1.username AS name')
			.then(resolve)
			.catch(reject);
		});
	}
	create(user_id){
		return new Promise((resolve, reject) => {
			dbInstance('streams')
			.insert({
				'user_id': user_id,
			})
			.debug(true)
			.then(async (data) => {
				if(!data) resolve(false);
				resolve(data);
			})
			.catch(reject);
		});
	}
	addPanel(title, description, user_id) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_panels')
			.insert({
				title,
				description,
				user_id
			})
			.debug(true)
			.then(async (data) => {
				if(!data) resolve(false);
				resolve(data);
			})
			.catch(reject);
		});
	}
	addStreamKey(user_id, stream_key) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_keys')
			.insert({
				'user_id': user_id,
				'stream_key': stream_key,
			})
			.debug(true)
			.then(async (data) => {
				if(!data) resolve(false);
				resolve(await this.getUserById(user_id));
			})
			.catch(reject);
		});
	}
	addArchive(user_id, streamName, duration, random, thumbnail, stream) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_archives')
			.insert({
				'user_id': user_id,
				streamName,
				duration,
				random,
				thumbnail,
				stream
			})
			.debug(true)
			.then(async (data) => {
				if(!data) resolve(false);
				resolve(data);
			})
			.catch(reject);
		});
	}
	setPanel(panel_id, title, description) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_panels').where({
				panel_id
			})
			.update({
				title,
				description
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setCategory(userId, category = '') {
		return new Promise((resolve, reject) => {
			dbInstance('stream').where({
				user_id: userId
			})
			.update({
				category,
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setTitle(userId, title = '') {
		return new Promise((resolve, reject) => {
			dbInstance('stream').where({
				user_id: userId
			})
			.update({
				title,
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setLive(streamId) {
		return new Promise((resolve, reject) => {
			dbInstance('stream').where({
				id: streamId
			})
			.update({
				live: 1
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setInactive(streamId) {
		return new Promise((resolve, reject) => {
			dbInstance('stream').where({
				id: streamId
			})
			.update({
				live: 0
			})
			.then(resolve)
			.catch(reject);
		});
	}
	updateTime(streamId) {
		return new Promise((resolve, reject) => {
			dbInstance('stream').where({
				id: streamId
			})
			.update({
				time: dbInstance.fn.now()
			})
			.then(resolve)
			.catch(reject);
		});
	}
	// CURRENT_TIMESTAMP
	setPrivate(streamId, bool) {
		return new Promise((resolve, reject) => {
			dbInstance('stream').where({
				user_id: streamId
			})
			.update({
				private: bool ? 1 : 0
			})
			.then(resolve)
			.catch(reject);
		});
	}
	increaseView(streamId) {
		return new Promise((resolve, reject) => {
			dbInstance('stream').where({
				id: streamId
			})
			.increment('views', 1)
			.then(resolve)
			.catch(reject);
		});
	}
	deletePanel(panel_id) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_panels').where({
				panel_id
			})
			.delete()
			.then(resolve)
			.catch(reject);
		});
	}
}
export default Stream;