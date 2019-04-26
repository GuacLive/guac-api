import { send,json } from 'micro';
import { compose } from 'micro-hoofs';

import channelModel from '../../models/channel';

import userModel from '../../models/user';

import verifySecretKey from '../../services/verifySecretKey';

module.exports = compose(
	verifySecretKey
)(
	async (req, res) => {
		const channel = new channelModel;
		const user = new userModel;
		const jsonData = await json(req);
		if(jsonData && jsonData.channel){
			/*
				Authentication is done through secret key.
				This is because validation is done locally on the chat server...
				Change this to JWT at some point?
			*/
			if(typeof jsonData.user_id === 'number' && jsonData.username){
				return send(res, 401, {
					statusCode: 401,
					statusMessage: 'This endpoint takes either an user_id or username, not both'
				});
			}
			if(jsonData.username){
				let user = await user.getUserByUsername(jsonData.username);
			}else if(typeof jsonData.user_id !== 'number'){
				return send(res, 401, {
					statusCode: 401,
					statusMessage: 'This endpoint takes either an user_id or username'
				});
			}
			let user_id = user && typeof user.id == 'number' ? user.id : jsonData.user_id;
			const result = await channel.UnmodUser(
				jsonData.channel,
				user_id
			);
			return send(res, 200, {
				statusCode: 200,
			});
		}else{
			// ???
			return send(res, 401, {
				statusCode: 401,
				statusMessage: 'Channel not found'
			});
		}
	}
);