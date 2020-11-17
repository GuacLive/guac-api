var SqlString = require('sqlstring');
const dbInstance = global.dbInstance;
class Search {
	search(term) {
		return new Promise((resolve, reject) => {
			dbInstance('stream')
			.distinct()
			.where('u1.username', 'like', `%${term}%`)
			.orWhere('stream.title', 'like', `%${term}%`)
            //.whereRaw('MATCH (u1.username) AGAINST(? IN BOOLEAN MODE) AND stream.private = 0', `%${SqlString.escape(term)}%`)
            //.orWhereRaw('MATCH (stream.title) AGAINST(? IN BOOLEAN MODE) AND stream.private = 0', `%${SqlString.escape(term)}%`)
			.debug(true)
			.join('users as u1', 'u1.user_id', '=', 'stream.user_id')
			.join('categories as c1', 'c1.category_id', '=', 'stream.category')
			.select('stream.*', 'u1.user_id', 'u1.username', 'u1.username AS name',
				'c1.category_id AS category_id', 'c1.name AS category_name', 'u1.type')
			.then(resolve)
			.catch(reject);
		});
	}
	searchCategories(term) {
		return new Promise((resolve, reject) => {
			dbInstance('categories')
			.distinct()
			.where('categories.name', 'like', `%${term}%`)
			.debug(true)
			.select('categories.category_id AS category_id', 'categories.name AS category_name')
			.then(resolve)
			.catch(reject);
		});
	}
}
export default Search;