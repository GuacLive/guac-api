import { send } from 'micro';
import { compose } from 'micro-hoofs';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
        const um = new userModel;
        const jsonData = await json(req);
		if(jsonData && jsonData.password){
            if(req.user && req.user.id){
                if(jsonData.password.length < 8){
                    return send(res, 400, {
                        statusCode: 400,
                        statusMessage: 'Password must be over 8 characters'
                    });
                }
                await um.changePassword(req.user.id, jsonData.password);
            }else{
                return send(res, 400, {
                    statusCode: 400,
                    statusMessage: 'You are not logged in'
                });
            }
        }else{
            return send(res, 400, {
                statusCode: 400,
                statusMessage: 'No password provided'
            });
        }
	}
);