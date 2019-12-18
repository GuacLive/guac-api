import { send,json } from 'micro';
import { compose } from 'micro-hoofs';

import userModel from '../../models/user';

import jwt from 'jsonwebtoken';

import { isReservedUsername } from '../../utils';

const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
module.exports = compose(
)(
	async (req, res) => {
		const um = new userModel;
		const jsonData = await json(req);
		if(jsonData && jsonData.username && jsonData.password){
			let username = jsonData.username;
			let password = jsonData.password;

			if(!USERNAME_REGEX.test(username.toLowerCase())){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'Not a valid username'
				});
			}

			if(isReservedUsername(username)){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'This username is reserved'
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
			if(await um.getUserByUsername_lower(username.toLowerCase())){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'User already exists'
				});
			}
			const user = await um.addUser(
				username,
				password
			);
			const jwtToken = jwt.sign({
				user
			}, process.env.JWT_SECRET, {
				algorithm: 'HS256'
			});
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