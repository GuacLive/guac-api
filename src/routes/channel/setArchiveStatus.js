import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const stream = new streamModel;
        const jsonData = await json(req);
		if(jsonData && typeof jsonData.archive !== 'boolean'){
            if(req.user && req.user.name){
                const result = await stream.getStream(req.user.name);
                await stream.setArchiveStatus(result.id, jsonData.archive);
                return send(res, 200, {
                    statusCode: 200,
					archive: jsonData.archive
                });
                
            }else{
                return send(res, 401, {
                    statusCode: 401,
                    statusMessage: 'You are not logged in'
                });
            }
        }else{
            return send(res, 400, {
                statusCode: 400,
                statusMessage: 'No archive flag provided'
            });
        }
	}
);