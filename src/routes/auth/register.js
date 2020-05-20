import { send,json } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

import jwt from 'jsonwebtoken';

import { isReservedUsername } from '../../utils';

import { USERNAME_REGEX } from '../../utils';
module.exports = compose(
)(
	async (req, res) => {
		const um = new userModel;
		const jsonData = await json(req);
		let username = jsonData.username;
		let email = jsonData.email;
		let password = jsonData.password;
		if(jsonData && username && email && password){
			if(!USERNAME_REGEX.test(username.toLowerCase())){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'Not a valid username'
				});
			}

			if(isReservedUsername(username.toLowerCase())){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'This username is reserved'
				});
			}

			if(!email.match(/^\S+@\S+$/)){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'This e-mail is invalid'
				});
			}

			if(username.length < 3){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'Username must be over 3 characters'
				});
			}

			if(password.length < 8){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'Password must be over 8 characters'
				});
			}

			// If user is already in database, error out
			if(await um.getUserByEmail(email.toLowerCase())){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'E-mail already exists'
				});
			}
			if(await um.getUserByUsername_lower(username.toLowerCase())){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'Username already exists'
				});
			}
			const user = await um.addUser(
				username,
				email,
				password
			);
			const jwtToken = jwt.sign({
				user
			}, process.env.JWT_SECRET, {
				algorithm: 'HS256'
			});
			um.sendActivationToken(email);
			return send(res, 200, {
				statusCode: 200,
				jwtToken,
				user
			});
		}else{
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No registration data provided'
			});
		}
	}
);