import {send, json} from 'micro';
import {compose} from 'micro-hoofs';

import { setAsyncActorKeys } from '../../crypto';

import userModel from '../../models/user';
  
module.exports = compose(
)(
	async (req, res) => {
		const um = new userModel;
		const username = req.params.username;
		var user = await um.getUserByUsername_lower(username);

		// Not all users have public key
		if(!user.publicKey){
			console.log('actor', user);
			await setAsyncActorKeys(user);
		}
		if(user){
			send(res, 200, {
				statusCode: 200,
				type: 'Person',
				id: `https://${req.headers.host || 'api.guac.live'}/actor/${user.name}`,
				name: user.name,
				url: `https://${global.nconf.get('server:domain')}/c/${user.name}`,
				preferredUsername: user.name,
				inbox: `https://${req.headers.host || 'api.guac.live'}/inbox`,
				publicKey: {
					id: `https://${req.headers.host || 'api.guac.live'}/actor/${user.name}#main-key`,
					owner: `https://${req.headers.host || 'api.guac.live'}/actor/${user.name}`,
					publicKeyPem: user.publicKey
				}
			});
		}else{
			send(res, 404, {
				statusCode: 404,
				error: 'User not found'
			});
		}
	}
);