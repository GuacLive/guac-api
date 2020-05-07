import {send, json} from 'micro';
import {compose} from 'micro-hoofs';

import { parse } from 'url';

import {patreon, oauth } from 'patreon';

import userModel from '../../models/user';

import verifyJWTKey from '../../services/verifyJWTKey';

const clientId = global.nconf.get('patreon:client_id');
const clientSecret = global.nconf.get('patreon:client_secret');

const redirectUri = 'https://guac.live/oauth/patreon';

const oauthClient = oauth(clientId, clientSecret);

module.exports = compose(
	verifyJWTKey
)(async (req, res) => {
	// This only works if the guac-web frontend forwards this request with a JWT token attached
	const user = req.user;
	const { query } = await parse(req.url, true);
	let oauthGrantCode = query.code;
	const u = new userModel;

	let tokenResponse = await oauthClient.getTokens(oauthGrantCode, redirectUri);
	
	if(tokenResponse){
		u
		.updatePatreon(
			user.id,
			{
				access_token: tokenResponse.access_token,
				refresh_token: tokenResponse.refresh_token
			}
		);
		return send(res, 200, {
			statusCode: 200,
			statusMessage: 'You are now a patron'
		});
	}else{
		return send(res, 401, {
			statusCode: 401,
			statusMessage: 'You are currently not a patron'
		});
	}
});