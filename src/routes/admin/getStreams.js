import { send } from 'micro';
import { compose } from 'micro-hoofs';

import fetch from 'node-fetch';

import verifyJWTKey from '../../services/verifyJWTKey';
import verifyUserStaff from '../../services/verifyUserStaff';

module.exports = compose(
    verifyJWTKey,
    verifyUserStaff
)(
	async (req, res) => {
        const auth = Buffer.from(`${global.nconf.get('nms:user')}:${global.nconf.get('nms:password')}`)
            .toString('base64');
        const data = await fetch(global.nconf.get('nms:host') + '/api/streams', {
            method: 'get',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
          
		send(200, res, {
            statusCode: 200,
            data
        });
	}
);