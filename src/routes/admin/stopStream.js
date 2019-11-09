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
        const stream = req.params.name;
        const auth = Buffer.from(`${global.nconf.get('nms:user')}:${global.nconf.get('nms:password')}`)
            .toString('base64');
        const nms = await fetch(`${global.nconf.get('nms:host')}/api/live/${stream}`, {
            method: 'delete',
            headers: new {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await nms.json();

		return send(res, 200, {
            statusCode: 200,
            data
        });
	}
);