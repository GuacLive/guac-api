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
        const nms = await fetch(global.nconf.get('nms:host') + '/api/streams', {
            method: 'get',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        var data = await nms.json();
        if(data.live){
            data.live = Object.keys(data.live).map(d => {
                // Hide IP if not admin
                if(req.user.type !== 'admin'){
                    delete d.publisher.ip;
                }
                return d;
            });

        }
          
		return send(res, 200, {
            statusCode: 200,
            data
        });
	}
);