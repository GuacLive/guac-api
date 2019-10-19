import { send,json } from 'micro';
import { compose } from 'micro-hoofs';

import searchModel from '../../models/search';

module.exports = compose(
)(
	async (req, res) => {
		const search = new searchModel;
		const jsonData = await json(req);
		if(jsonData && jsonData.term){
			let term = jsonData.term;
			let data = await search.search(term);
			return send(res, 200, {
				statusCode: 200,
				data
			});
		}else{
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No search term provided'
			});
		}
	}
);