import Redis from 'ioredis';

const dbInstance = global.dbInstance;
const redis = new Redis();
const CACHE_TIME = 60; // time to cache, in seconds
class Notification {
	getNotifications(user_id, page = 1) {
		return new Promise(async (resolve, reject) => {
			if(redis.get(`notifications:${user_id}:${page}`)){
				resolve(JSON.parse(await redis.get(`notifications:${user_id}:${page}`)));
			}else{
				dbInstance('notifications')
				.where({
					'notifications.user_id': user_id
				})
				.select('notifications.*', 'u1.username AS user_username', 'f1.username AS from_username')
				.orderBy('notification_id', 'desc')
				.join('users as u1', 'u1.user_id', '=', 'notifications.user_id')
				.join('users as f1', 'f1.user_id', '=', 'notifications.from_user_id')
				.paginate({
					perPage: 25,
					currentPage: page,
					isLengthAware: true
				})
				.debug(true)
				.then(async data => {
					await redis.set(`notifications:${user_id}:${page}`, JSON.stringify(data), 'ex', CACHE_TIME);
					resolve(data);
				})
				.catch(reject);
			}
		});
	}
	addNotification(user_id, from_user_id, action, message, rendered, item_id, item_type) {
		return new Promise((resolve, reject) => {
			dbInstance('notifications')
			.insert({
				user_id,
				from_user_id,
				action,
				message,
				rendered,
				item_id,
				item_type
			})
			.debug(true)
			.then(async data => {
				if(!data) resolve(false);
				await redis.del(`notifications:${user_id}:1`);
				resolve(data);
			})
			.catch(reject);
		});
	}
}
export default Notification