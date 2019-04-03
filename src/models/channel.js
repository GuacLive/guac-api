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
	getFollowsFrom(from_id) {
		return new Promise((resolve, reject) => {
			dbInstance('follows')
			.where({
				'from_id': from_id
			})
			.select('follows.*', 'stream.live', 'stream.title', 'users.username')
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
			.select('follows.*', 'stream.live', 'stream.title', 'users.username')
			.join('stream', 'stream.user_id', '=', 'follows.to_id')
			.join('users', 'users.user_id', '=', 'follows.to_id')
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
				'user_id': userToBan
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	unbanUser(room, userToBan, reason = '') {
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
}
export default Channel;