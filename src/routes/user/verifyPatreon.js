import {send, json} from 'micro';
import {compose} from 'micro-hoofs';

import userModel from '../../models/user';

import verifyJWTKey from '../../services/verifyJWTKey';

const clientId = global.nconf.get('patreon:client_id');
const clientSecret = global.nconf.get('patreon:client_secret');
const campaignID = global.nconf.get('patreon:campaign_id');

const refresh = async (user, userPatreonObject) => {
	fetch(
		'https://www.patreon.com/api/oauth2/token',
		{
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data: formUrlEncoded({
			grant_type: 'refresh_token',
			refresh_token: userPatreonObject.refresh_token,
			client_id: clientId,
			client_secret: clientSecret,
		})
	}).then(async response => {
		let patreonObject = userPatreonObject;
		patreonObject.access_token = response.data.access_token;
		patreonObject.refresh_token = response.data.refresh_token;

		await u.updatePatreon(
			user.id,
			userPatreonObject
		).catch(e => {
			return console.error(e.message);
		});
	}).catch(e => {
		console.error(e.response.data);
	})
};

module.exports = compose(
	verifyJWTKey
)(async (req, res) => {
	const user = req.user;
	const u = new userModel;

	const userPatreonObject  =
	await u
	.getUserById(user.id)
	.then(data => {
		// yes this should be twice
		if(typeof data.patreon === 'string'){
			data.patreon = JSON.parse(data.patreon);
		}
		if(typeof data.patreon === 'string'){
			data.patreon = JSON.parse(data.patreon);
		}
		return data.patreon;
	}).catch(e => {
		console.error(e.message)
	})

	if(!userPatreonObject){
		return send(res, 403, {
			statusCode: 403,
			statusMessage: 'You have not linked your patreon'
		});
	}

	const patronData =
		await fetch('https://www.patreon.com/api/oauth2/v2/identity?include=memberships.campaign&fields%5Bmember%5D=full_name,is_follower,email,last_charge_date,last_charge_status,lifetime_support_cents,patron_status,currently_entitled_amount_cents,pledge_relationship_start,will_pay_amount_cents&fields%5Btier%5D=title&fields%5Buser%5D=full_name,hide_pledges', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${userPatreonObject.access_token}`,
			}
		})
		.then((res) => {
			if(res.status === 401){
				Promise.reject(res);
				return refresh(user, userPatreonObject);
			}
			return res;
		})
		.then(r => r.json())
		.then(response => {
			if(response.included && typeof response.included[Symbol.iterator] === 'function'){
				for(const included of response.included){
					if(included && included.relationships){
						if(campaignID == included.relationships.campaign.data.id){
							return included;
						}
					}
				}
			}
		})
		.catch(e => {
			console.error(e);
			return send(res, 500, {
				statusCode: 500,
				statusMessage: 'Something went wrong fetching patreon api'
			})
		});

	if(!patronData){
		return send(res, 401, {
			statusCode: 401,
			statusMessage: 'You are currently not a patron'
		});
	}
	
	const amount = patronData.attributes.currently_entitled_amount_cents;
	const patron_status = patronData.attributes.patron_status.toLowerCase();
	const last_charged_status = patronData.attributes.last_charge_status.toLowerCase();

	// the amount was less than $5
	if(amount < 500){
		console.log('debug (amount): ' + patronData.attributes);
		return send(res, 402, {
			statusCode: 402,
			statusMessage: 'Patron status is only allowed at $5 or more'
		});
	}

	// the user is not an active patron
	if(patron_status !== 'active_patron'){
		console.log('debug (patron_status): ' + patronData.attributes);
		return send(res, 403, {
			statusCode: 403,
			statusMessage: 'Not an active patron'
		});
	}

	// the last transaction failed
	if(last_charged_status !== 'paid'){
		console.log('debug (last_charged_status): ' + data.attributes);
		return send(res, 402, {
			statusCode: 402,
			statusMessage: 'Last patreon payment was declined'
		});
	}

	let newTier;

	if(amount >= 500 && amount < 1000) {
		newTier = 1;
	}else if (amount >= 1000 && amount < 3000){
		newTier = 2
	}else if (amount >= 3000){
		newTier = 3;
	}

	// the user is already verified but linking patreon should be idempotent
	if(userPatreonObject.isPatron && newTier === userPatreonObject.tier){
		return send(res, 200, {
			statusCode: 200,
			statusMessage: 'You are a patron already!'
		});
	}

	userPatreonObject.isPatron = true;
	userPatreonObject.tier = newTier;

	try{
		await u.updatePatreon(
			user.id,
			userPatreonObject
		);
		return send(res, 200, {
			statusCode: 200,
			statusMessage: 'You are a patron already!'
		});
	}catch(e){
		return send(res, 500, {
			statusCode: 500,
			statusMessage: 'An error occurred while linking your account!'
		})
	};
});