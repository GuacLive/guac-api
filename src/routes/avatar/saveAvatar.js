import { send } from 'micro';
import { compose } from 'micro-hoofs';

const mimeTypes = require('mime-types');

import userModel from '../../models/user';
import verifyJWTKey from '../../services/verifyJWTKey';
import uploadService from '../../services/upload';

import { bufferToStream, bufferToHash } from '../../utils';
module.exports = compose(
	verifyJWTKey,
	uploadService
)(
	async (req, res) => {
		const um = new userModel;
		console.log(req.s3, req.file);
		if(!req.user.id){
			return send(res, 403, {
				statusCode: 403,
			});
		}
		// For now, only allow streamers/admins/staff to upload avatar
		if(req.user.type === 'user' && !req.user.can_stream){
			return send(res, 403, {
				statusCode: 403,
				statusMessage: 'Avatar upload is only for streamers, admins and staff'
			});
		}
		if(!req.s3 || !req.file || !req.file.buffer){
			return send(res, 400, {
				statusCode: 400,
			});
		}
		const { profilePicBlobStore } = req.s3;
		console.log('profilePicBlobStore', profilePicBlobStore);

		// If user already has an avatar, remove it
        const url = req.user.avatar;
        if(url) {
			var id = url.substring(url.lastIndexOf('/')+1, url.length);

			const params = {key: id};
			profilePicBlobStore.remove(params, function(err, data) {
				//if (err) return console.log(err, err.stack);
			});
        }
	
		// Turn file buffer data into a stream
		const stream = bufferToStream(req.file.buffer);

		// Get extension for this mime type
		let ext = mimeTypes.extension(req.file.mimetype);

		// Unrocognized mime type
		if(['png', 'gif', 'jpg', 'jpeg', 'bmp'].indexOf(ext) === -1) {
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'Image must be a png, gif or jpg'
			});
		}

		var hash = bufferToHash(req.file.buffer);
		var id = `${hash}.${ext}`;

		stream.pipe(profilePicBlobStore.createWriteStream({
			key: id,
			params: {
				ACL: 'public-read',
				CacheControl: 'max-age=31536000'
			}
		}))
		.on('error', console.error.bind(console))
		.on('finish', async (file) => {
			await um.updateAvatar(req.user.id, `${global.nconf.get('s3:cdn_endpoint')}/profile-avatars/${id}`);
		})
		return send(res, 200, {
			statusCode: 200,
		});
	}
);