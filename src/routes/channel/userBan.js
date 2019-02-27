import { send } from 'micro';
import { compose, parseJSONInput } from 'micro-hoofs';

import channelModel from '../../models/channel';

import userModel from '../../models/user';

import verifySecretKey from '../../services/verifySecretKey';

module.exports = compose(
	verifySecretKey,
	parseJSONInput
)(
	async (req, res) => {
		const channel = new channelModel;
		const user = new userModel;
		if(req.json && req.json.channel){
			/*
				Authentication is done through secret key.
				This is because validation is done locally on the chat server...
				Change this to JWT at some point?
			*/
			if(req.json.user_id && req.json.username){
				return send(res, 401, {
					statusCode: 401,
					statusMessage: 'This endpoint takes either an user_id or username, not both'
				});
			}
			if(req.json.username){
				let user = await user.getUserByUsername(req.json.username);
			}else if(!req.json.user_id){
				return send(res, 401, {
					statusCode: 401,
					statusMessage: 'This endpoint takes either an user_id or username'
				});
			}
			let user_id = user && user.id ? user_id : req.json.user_id;
			const result = await channel.banUser(
				req.json.channel,
				user_id,
				'No reason provided'
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