import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

import verifyJWTKey from '../../services/verifyJWTKey';

const HEX_REGEX = /^#[0-9A-F]{6}$/i;
module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
        const um = new userModel;
        const jsonData = await json(req);
		if(jsonData && jsonData.color){
            if(req.user && req.user.id){
                if(!HEX_REGEX.test(jsonData.color.length)){
                    return send(res, 400, {
                        statusCode: 400,
                        statusMessage: 'Not a valid hex color'
                    });
                }
                if(req.user.patreon && req.user.patreon.isPatron){
                    await um.changeColor(req.user.id, jsonData.color);
                    return send(res, 200, {
                        statusCode: 200,
                    });
                }else{
                    return send(res, 401, {
                        statusCode: 401,
                        statusMessage: 'You are currently not a patron'
                    });
                }
            }else{
                return send(res, 401, {
                    statusCode: 401,
                    statusMessage: 'You are not logged in'
                });
            }
        }else{
            return send(res, 400, {
                statusCode: 400,
                statusMessage: 'No color provided'
            });
        }
	}
);