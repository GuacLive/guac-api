const dbInstance = global.dbInstance;
class Stream {
	getChannels(name) {
		return new Promise((resolve, reject) => {
			dbInstance('stream')
			.orderBy('id', 'desc')
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getFeatured(name) {
		return new Promise((resolve, reject) => {
			dbInstance('stream')
			.select(['id', 'u1.username AS name'])
			.where({
				'live': 1
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
			.select('stream.*', 'u1.user_id', 'u1.username', 'u1.username AS name')
			.first()
			.then(resolve)
			.catch(reject);
		});
	}
	getStreamKey(streamKey) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_keys').where({
				stream_key: streamKey
			})
			.join('stream as s1', 's1.id', '=', 'stream_keys.id')
			.debug(true)
			.select('stream_keys.*', 's1.*')
			.first()
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