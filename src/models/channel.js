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
	getFollowing(user_id) {
		return new Promise((resolve, reject) => {
			dbInstance('followers')
			.where({
				'user_id': user_id
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getFollowers(following_id) {
		return new Promise((resolve, reject) => {
			dbInstance('followers')
			.where({
				'following_id': following_id
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