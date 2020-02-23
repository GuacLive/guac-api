import { send, json } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

module.exports = compose(
)(
	async (req, res) => {
		const um = new userModel;
		const data = await json(req);
		if(data && data.token){
		    try{
                await um.activate(data.token);
                send(res, 200, {
                    statusCode: 200,
                });
            }catch(e){
                send(res, 400, {
                    statusCode: 400,
                    error: 'Invalid token'
                });
            }
		}else{
			send(res, 400, {
				statusCode: 400,
				error: 'No token provided'
			});
		}
	}
);