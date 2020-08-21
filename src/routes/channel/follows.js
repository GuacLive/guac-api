import { send } from 'micro';
import { compose } from 'micro-hoofs';

import { parse } from 'url';

import channelModel from '../../models/channel';

import streamModel from '../../models/stream';

import { USERNAME_REGEX } from '../../utils';
module.exports = compose(
)(
	async (req, res) => {
		const { query } = await parse(req.url, true);
		if(!req.params.name || !USERNAME_REGEX.test(req.params.name)){
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No stream name given'
			});
        }
        const channel = new channelModel;
		const stream = new streamModel;
		const streamResult = await stream.getStream(req.params.name);
		if(streamResult && streamResult.user_id){
			const data = await channel.getFollowsToWithUser(
                streamResult.user_id,
                parseInt(query.$limit, 10),
                parseInt(query.$skip, 10)
            );
            const result = await Promise.all(data.map(async (r) => {
                if(r){
                    r.avatar = r.avatar || `//api.${global.nconf.get('server:domain')}/avatars/unknown.png`;
                }
                return r;
            }));			
			return send(res, 200, {
                statusCode: 200,
                data: result
			});
		}else{
			return send(res, 404, {
				statusCode: 404,
				statusMessage: 'Stream not found'
			});
		}
	}
);