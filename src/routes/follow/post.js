import { send,json } from 'micro';
import { compose } from 'micro-hoofs';

import channelModel from '../../models/channel';
import userModel from '../../models/user';

import verifyJWTKey from '../../services/verifyJWTKey';

import { sendViewerAPIEvent } from '../../utils';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const channel = new channelModel;
		const u = new userModel;
		const jsonData = await json(req);
		const time = (new Date).toGMTString();
		if(jsonData && jsonData.to_id){
			let fromId = req.user.id;
			let toId = jsonData.to_id;
			let toUser = u.getUserById(toId);
			// If user is already in database, unfollow
			if(await channel.follows(fromId, toId)){
                await channel.unfollow(fromId, toId);
				return send(res, 200, {
					statusCode: 200,
					statusMessage: 'Person unfollowed'
				});
			}
			await channel.follow(
                fromId,
                toId,
			);
			try{
				sendViewerAPIEvent(toUser.username, 'follow', {
					time,
					user: {
						name: req.user.name,
					}
				});
			}catch(e){}
			return send(res, 200, {
                statusCode: 200,
                statusMessage: 'Person followed'
			});
		}else{
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No to_id provided'
			});
		}
	}
);