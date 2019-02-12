const dbInstance = global.dbInstance;
class Channel {
	getBans(room) {
		return new Promise((resolve, reject) => {
			dbInstance('channel_bans')
			.where({
				'room_id': room
			})
			.orderBy('id', 'desc')
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