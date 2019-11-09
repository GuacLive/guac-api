import { send } from 'micro';
import { compose } from 'micro-hoofs';

import fetch from 'node-fetch';

import verifyJWTKey from '../../services/verifyJWTKey';
import verifyUserStaff from '../../services/verifyUserStaff';

module.exports = compose(
    verifyJWTKey,
    verifyUserStaff
)(
	async (req, response) => {
        const auth = Buffer.from(`${global.nconf.get('nms:user')}:${global.nconf.get('nms:password')}`)
            .toString('base64');
        fetch(global.nconf.get('nms:host') + '/api/streams', {
            method: 'get',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json()) // expecting a json response
        .then(data => {
            send(200, response, {
                statusCode: 200,
                data
            });
        })
        .catch(e => {
            send(500, response, {
                statusCode: 500,
                error: e
            });
        });
	}
);