import { send } from 'micro';
import { compose } from 'micro-hoofs';

import fetch from 'node-fetch';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
    verifyJWTKey
)(
	async (req, res) => {
        if(!req.user || req.user.type == 'user'){
            send(403, res, {
                statusCode: 403,
                statusMessage: 'No.'
            });
        }

        const auth = Buffer.from(`${global.nconf.get('nms:user')}:${global.nconf.get('nms:password')}`)
            .toString('base64');
        const data = await fetch(global.nconf.get('nms:host') + '/api/streams', {
            method: 'get',
            headers: new Headers({
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            })
        });
          
		send(200, res, {
            statusCode: 200,
            data
        });
	}
);