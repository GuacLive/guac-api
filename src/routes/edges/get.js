import { send } from 'micro';
import { compose } from 'micro-hoofs';
import cache from 'micro-cacheable';

// Cache response for 1 minute
module.exports = cache(60 * 1000, compose(
)(
	async (req, res) => {
		send(res, 200, {
			statusCode: 200,
			regions: {
				eu: [
					'stream'
				]
			}
		});
	}
));