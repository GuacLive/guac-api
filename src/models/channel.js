const dbInstance = global.dbInstance;
class Channel {
	getBans(room) {
		return new Promise((resolve, reject) => {
			dbInstance('channel_bans')
			.where({
				'room_id': room
			})
			.orderBy('ban_id', 'desc')
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getMods(room){
		return new Promise((resolve, reject) => {
			dbInstance('channel_mods').where({
				'room_id': room
			})
			.debug(true)
			.join('users as u1', 'u1.user_id', '=', 'channel_mods.user_id')
			.select('u1.user_id', 'u1.username AS name', 'u1.type')
			.then(resolve)
			.catch(reject);
		});
	}
	getTimeouts(room) {
		return new Promise((resolve, reject) => {
			dbInstance('channel_timeouts')
			.where({
				'room_id': room
			})
			.orderBy('timeout_id', 'desc')
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getFollowsFrom(from_id) {
		return new Promise((resolve, reject) => {
			dbInstance('follows')
			.where({
				'from_id': from_id
			})
			.select('follows.*', 'stream.live', 'stream.title', 'users.username', 'users.avatar')
			.join('stream', 'stream.user_id', '=', 'follows.to_id')
			.join('users', 'users.user_id', '=', 'follows.to_id')
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getFollowsTo(to_id) {
		return new Promise((resolve, reject) => {
			dbInstance('follows')
			.where({
				'to_id': to_id
			})
			.select('follows.*', 'stream.live', 'stream.title', 'users.username', 'users.avatar')
			.join('stream', 'stream.user_id', '=', 'follows.to_id')
			.join('users', 'users.user_id', '=', 'follows.to_id')
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	follows(from_id, to_id) {
		return new Promise((resolve, reject) => {
			dbInstance('follows')
			.where({
				'from_id': from_id,
				'to_id': to_id
			})
			.select('follows.*')
			.limit(1)
			.debug(true)
			.then((data) => {
				resolve(data.length > 0);
			})
			.catch(reject);
		});
	}
	follow(from_id, to_id) {
		return new Promise((resolve, reject) => {
			dbInstance('follows')
			.insert({
				'from_id': from_id,
				'to_id': to_id
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	unfollow(from_id, to_id) {
		return new Promise((resolve, reject) => {
			dbInstance('follows')
			.delete()
			.where({
				'from_id': from_id,
				'to_id': to_id
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	modUser(room, userToMod) {
		return new Promise((resolve, reject) => {
			dbInstance('channel_mods')
			.insert({
				'room_id': room,
				'user_id': userToMod
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	unmodUser(room, userToMod) {
		return new Promise((resolve, reject) => {
			dbInstance('channel_mods')
			.delete()
			.where({
				'room_id': room,
				'user_id': userToMod
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	banUser(room, userToBan, reason = '') {
		return new Promise((resolve, reject) => {
			dbInstance('channel_bans')
			.insert({
				'room_id': room,
				'user_id': userToBan,
				'reason': reason
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	unbanUser(room, userToBan) {
		return new Promise((resolve, reject) => {
			dbInstance('channel_bans')
			.delete()
			.where({
				'room_id': room,
				'user_id': userToBan
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	timeoutUser(room, userToBan, timeout = 0) {
		return new Promise((resolve, reject) => {
			dbInstance('channel_timeouts')
			.insert({
				'room_id': room,
				'user_id': userToBan,
				'time': timeout
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
}
export default Channel;