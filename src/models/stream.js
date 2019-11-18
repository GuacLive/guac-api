const dbInstance = global.dbInstance;
class Stream {
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
	getChannels(onlyLive = false) {
		let where = {
			'private': 0
		};
		if(onlyLive) where.live = 1;
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
			.select(['id', 'u1.username AS name', 'u1.type'])
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
	getStream(name) {
		return new Promise((resolve, reject) => {
			dbInstance('stream').where({
				'u1.username': name
			})
			.debug(true)
			.join('users as u1', 'u1.user_id', '=', 'stream.user_id')
			.leftJoin('channel_mods as m1', 'm1.room_id', '=', 'stream.user_id')
			.join('categories as c1', 'c1.category_id', '=', 'stream.category')
			.select('stream.*', 'u1.user_id', 'u1.username AS name',
				'c1.category_id AS category_id', 'c1.name AS category_name', 'u1.type')
			.first()
			.then(resolve)
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
			.select('stream_keys.*', 's1.*', 'u1.username AS name')
			.first()
			.then(resolve)
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
}
export default Stream;