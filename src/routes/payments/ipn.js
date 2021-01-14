import { send } from 'micro';
import { compose } from 'micro-hoofs';
import ipn from 'paypal-ipn-checker';
import parse from 'urlencoded-body-parser';

import userModel from '../../models/user';
import streamModel from '../../models/stream';

function getDaysInMonth(year, month) {
	return new Date(year, month + 1, 0).getDate();
}

function addMonths(date, value) {
	var d = new Date(date),
		n = date.getDate();
	d.setDate(1);
	d.setMonth(d.getMonth() + value);
	d.setDate(Math.min(n, getDaysInMonth(d.getFullYear(), d.getMonth())));
	return d;
}

module.exports = compose(
)(
	async (req, res) => {
		const data = await parse(req);
		send(res, 200);
		console.log('data', data);
		const um = new userModel;
		const sm = new streamModel;
		//You can also pass a settings object to the verify function:
		ipn.verify(data, {
			'allow_sandbox': process.env.NODE_ENV === 'development'
		}, async (err, msg) => {
			console.log('ipn verify');
			console.log(msg, err);
			
			if(err){
				console.error(err);
			}else{
				if(msg.substring(0, 8) === 'VERIFIED'){
					//The IPN is verified, process it
					console.log('Verified IPN!');
					console.log('\n\n');
		
					// assign posted variables to local variables
					var item_name = data['item_name'];
					var first_name = data['first_name'];
					var item_number = data['item_number'];
					var payment_status = data['payment_status'];
					var initial_payment_status = data['initial_payment_status'];
					var payment_amount = data['mc_gross'];
					var payment_currency = data['mc_currency'];
					var txn_type = data['txn_type'];
					var recurring_payment_id = data['recurring_payment_id'] || data['subscr_id'];
					var receiver_email = data['receiver_email'];
					var payer_email = data['payer_email'];
					let subscr_date = subscr_date ? new Date(data['subscr_date']) : null;

					var user = await um.getUserByEmail(payer_email);
					var plan = await sm.getPlan(item_number, receiver_email);
					console.log(plan.price, payment_amount, payment_currency);
					console.log(plan.email, receiver_email);
					console.log(user, user.user_id, user.email, payer_email);
					if(
						plan.item_number === item_number
						&&
						plan.price === payment_amount
						&&
						payment_currency === 'USD'
						&&
						plan.email === receiver_email
						&&
						user
						&&
						user.user_id
						&&
						user.email === payer_email
					){
						let subscribed;
						let cancelled = false;
						switch (txn_type) {
							case 'merch_pmt':
								subscribed = true;
								break;
							case 'subscr_payment':
								subscribed = true;
								break;
							case 'subscr_signup':
								subscribed = true;
								break;
							case 'recurring_payment':
								subscribed = true;
								break;
							case 'web_accept': 
								subscribed = true;
								break;
							case 'recurring_payment_profile_created':
								subscribed = true;
								break;
							case 'recurring_payment_failed':
								subscribed = false;
								break;
							case 'recurring_payment_profile_cancel':
								subscribed = false;
								cancelled = true;
								break;
							case 'recurring_payment_suspended':
								subscribed = false;
								break;
							case 'recurring_payment_suspended_due_to_max_failed_payment':
								subscribed = false;
								break;
							case 'subscr_cancel':
								subscribed = false;
								cancelled = true;
								break;
							case 'subscr_failed':
								subscribed = false;
								break;
							case 'mp_cancel':
								subscribed = false;
								break;
							default: console.log(`Unforseen IPN txn_type field: ${txn_type}`);
						}
						if(subscribed === true){
							if(payment_status === 'Completed' || initial_payment_status === 'Completed'){
								um.updateSubscription({
									'user_id': user.id,
									'subscription_plans_id': plan.id,
									'start_date': subscr_date.getTime(),
									'expiration_date': addMonths(subscr_date, 1).getTime(),
									'status': 'active',
									'recurring_payment_id': recurring_payment_id
								});
							}else{
								um.updateSubscription({
									'user_id': user.id,
									'subscription_plans_id': plan.id,
									'start_date': subscr_date.getTime(),
									'expiration_date': addMonths(subscr_date, 1).getTime(),
									'status': 'pending',
									'recurring_payment_id': recurring_payment_id
								});
							}
						}else if(subscribed === false && cancelled === false){
							um.updateSubscription({
								'user_id': user.id,
								'subscription_plans_id': plan.id,
								'status': 'inactive',
								'recurring_payment_id': recurring_payment_id
							});
						}else{
							um.updateSubscription({
								'user_id': user.id,
								'subscription_plans_id': plan.id,
								'recurring_payment_id': recurring_payment_id
							});
						}
					}
				}
			}
		});
	}
);