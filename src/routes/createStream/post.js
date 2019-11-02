import crypto from 'crypto';

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
		if(req.user && (req.user.type === 'admin' || req.user.type === 'staff')){
            if(
                jsonData
                && jsonData.user_id
            ){
                let streamResult = await stream.create(jsonData.user_id);
                if(streamResult){
                    let key = crypto.randomBytes(20).toString('hex');
                    await stream.createKey(streamResult.id, key);
                }
            }
        }else{            
            send(res, 401, {
                statusCode: 401,
                statusMessage: 'Unauthorized'
            });
        }
	}
);