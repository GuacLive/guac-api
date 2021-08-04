const dbInstance = global.dbInstance;
const prisma = global.prisma;
class Stream {
	getTotal(){
		return new Promise((resolve, reject) => {
			prisma.stream.aggregate({
				_count: {
				  id: true,
				},
			  })
			.then((result) => {
				console.log('stream total', result._count.id);
				if(result && result._count && result._count.id) return resolve(result._count.id);
				return resolve(0);
			})
			.catch(reject);
		});
	}
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
	getArchive(archive_id) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_archives')
			.where({
				'stream_archives.archive_id': archive_id
			})
			.select('stream_archives.*',  'u1.user_id', 'u1.username AS name', 'u1.type', 'u1.avatar', 'u1.banned')
			.orderBy('archive_id', 'desc')
			.join('users as u1', 'u1.user_id', '=', 'stream_archives.user_id')
			.join('stream', 'stream.user_id', '=', 'stream_archives.user_id')
			.debug(true)
			.first()
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
	getCategory(category_id) {
		return new Promise((resolve, reject) => {
			prisma.categories.findUnique({
				where: {
					category_id
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	// getCategories should be a seperate model mayhaps?
	getCategories(page) {
		return new Promise((resolve, reject) => {
			dbInstance('categories')
			.orderBy('category_id', 'asc')
			.paginate({
				perPage: 25,
				currentPage: page,
				isLengthAware: true
			})
			.debug(true)
			.then(resolve)
			.catch(reject);
		});
	}
	getClip(uuid) {
		return new Promise((resolve, reject) => {
			dbInstance('clips')
			.select('clips.*', 'su1.avatar AS stream_avatar', 's1.type AS stream_type', 'u1.user_id AS clipper_id',  'su1.user_id AS streamer_id', 'su1.username AS stream_name', 'u1.username AS clipper_name')
			.orderBy('clip_id', 'desc')
			.where({
				'clips.uuid': uuid
			})
			.join('stream as s1', 's1.id', '=', 'clips.stream_id')
			.join('users as su1', 'su1.user_id', '=', 's1.user_id')
			.join('users as u1', 'u1.user_id', '=', 'clips.clipper_id')
			.debug(true)
			.first()
			.then(resolve)
			.catch(reject);
		});
	}
	getClips(name, page) {
		return new Promise((resolve, reject) => {
			let inst = dbInstance('clips')
			.select('clips.*', 'su1.username AS name', 'u1.username AS clipper_name')
			.orderBy('clip_id', 'desc')
			.where({
				'su1.username': name
			})
			.join('stream as s1', 's1.id', '=', 'clips.stream_id')
			.join('users as su1', 'su1.user_id', '=', 's1.user_id')
			.join('users as u1', 'u1.user_id', '=', 'clips.clipper_id');
			inst
			.paginate({
				perPage: 25,
				currentPage: page,
				isLengthAware: true
			})
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
			.select('stream.*', 'u1.user_id', 'u1.username AS name', 'u1.avatar',
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
	/* Gets all live non-private streams */
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
			.whereNot('subscriptions.status', 'inactive')
			.debug(true)
			.select(
				'subscriptions.id AS sub_id',
				'subscriptions.start_date',
				'subscriptions.expiration_date',
				'subscriptions.status',
				'subscriptions.user_id',
				'users.user_id AS user_id',
				'users.username'
			)
			.leftJoin('subscription_plans', 'subscriptions.subscription_plans_id', '=', 'subscription_plans.id')
			.leftJoin('users', 'subscriptions.user_id', '=', 'users.user_id')
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
	hasSubscriptionPlans(stream_id) {
		return new Promise((resolve, reject) => {
			dbInstance('subscription_plans').where({
				'stream_id': stream_id
			})
			.debug(true)
			.count('stream_id AS count')
			.first()
			.then((total) => {
				resolve(total.count > 0);
			})
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
			.catch((e) => {
				console.log('getstream db error', e);
				reject(e);
			});
		});
	}
	getStreamConfig(name) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_config').where({
				'u1.username': name
			})
			.debug(true)
			.join('stream as s1', 's1.id', '=', 'stream_config.stream_id')
			.join('users as u1', 'u1.user_id', '=', 's1.user_id')
			.select('stream_config.*', 'u1.user_id', 'u1.username AS name', 'u1.banned')
			.first()
			.then(resolve)
			.catch((e) => {
				console.log('getstreamconfig db error', e);
				reject(e);
			});
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
			.join('stream as s1', 's1.id', '=', 'stream_keys.stream_id')
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
			.join('stream as s1', 's1.id', '=', 'stream_keys.stream_id')
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
			dbInstance('stream')
			.insert({
				'user_id': user_id,
				'private': 0,
				'live': 0,
				'views': 0,
				'category': 1,
				'type': 'NONE',
				'title': ''
			}, 'stream.id')
			.debug(true)
			.then(async (data) => {
				if(!data) resolve(false);
				resolve(data);
			})
			.catch(reject);
		});
	}
	createClip(stream_id, clip_name, clipper_id, video_url, uuid, category = 0){
		return new Promise((resolve, reject) => {
			dbInstance('clips')
			.insert({
				stream_id,
				clip_name,
				clipper_id,
				video_url,
				uuid,
				category
			}, 'clips.clip_id')
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
	addStreamKey(user_id, stream_id, stream_key) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_keys')
			.insert({
				'stream_id': stream_id,
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
	// TODO: Change this to stream id
	setArchiveStatus(streamId, archive = false) {
		return new Promise((resolve, reject) => {
			dbInstance('stream_config')
			.insert({
				archive,
				stream_id: streamId
			})
			.onConflict('stream_id')
			.merge()
			.then(resolve)
			.catch(reject);
		});
	}
	setPanel(panel_id, title, description) {
		return new Promise((resolve, reject) => {
			prisma.stream_panels.update({
				where: {
					panel_id
				},
				data: {
					title,
					description
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setBanner(userId, banner = '') {
		return new Promise((resolve, reject) => {
			prisma.stream.update({
				where: {
					user_id: userId
				},
				data: {
					banner
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setCategory(userId, category = '') {
		return new Promise((resolve, reject) => {
			prisma.stream.update({
				where: {
					user_id: userId
				},
				data: {
					category
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setTitle(userId, title = '') {
		return new Promise((resolve, reject) => {
			prisma.stream.update({
				where: {
					user_id: userId
				},
				data: {
					title
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setLive(streamId) {
		return new Promise((resolve, reject) => {
			prisma.stream.update({
				where: {
					id: streamId
				},
				data: {
					live: 1
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setInactive(streamId) {
		return new Promise((resolve, reject) => {
			prisma.stream.update({
				where: {
					id: streamId
				},
				data: {
					live: 0
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	updateTime(streamId) {
		return new Promise((resolve, reject) => {
			prisma.stream.update({
				where: {
					id: streamId
				},
				data: {
					time: new Date().toISOString().slice(0, 19).replace('T', ' ')
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	// CURRENT_TIMESTAMP
	setPrivate(streamId, bool) {
		return new Promise((resolve, reject) => {
			prisma.stream.update({
				where: {
					id: streamId
				},
				data: {
					private: bool ? 1 : 0
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	setServer(streamId, streamServer = '') {
		return new Promise((resolve, reject) => {
			prisma.stream.update({
				where: {
					id: streamId
				},
				data: {
					streamServer
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	increaseView(streamId) {
		return new Promise((resolve, reject) => {
			prisma.stream.update({
				where: {
					id: streamId
				},
				data: {
					views: {
						increment: 1,
					},
				},
			})
			.then(resolve)
			.catch(reject);
		});
	}
	deleteArchive(archive_id) {
		return new Promise((resolve, reject) => {
			prisma.stream_archives.delete({
				where: {
					archive_id
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
	deletePanel(panel_id) {
		return new Promise((resolve, reject) => {
			prisma.stream_panels.delete({
				where: {
					panel_id
				}
			})
			.then(resolve)
			.catch(reject);
		});
	}
}
export default Stream;