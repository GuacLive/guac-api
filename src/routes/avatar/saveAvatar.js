import { send } from 'micro';
import { compose } from 'micro-hoofs';

const { Readable } = require('stream');
const mimeTypes = require('mime-types');

import userModel from '../../models/user';
import verifyJWTKey from '../../services/verifyJWTKey';
import uploadService from '../../services/upload';

import { bufferToHash } from '../../utils';
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
		if(!req.s3 || !req.file || !req.file.buffer){
			return send(res, 400, {
				statusCode: 400,
			});
		}
		const { profilePicBlobStore } = req.s3;
		console.log('profilePicBlobStore', profilePicBlobStore);

		// TODO: If user already has an avatar, remove it
		
		// Turn file buffer data into a stream
		const stream = Readable.from(req.file.buffer.toString());

		// Get extension for this mime type
		let ext = mimeTypes.extension(req.file.mimetype);

		// Unrocognized mime type
		if(['.png', '.gif', '.jpg', '.jpeg', '.bmp'].indexOf(ext) === -1) {
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'Image must be a png, gif or jpg'
			});
		}

		const hash = bufferToHash(buffer);
		const id = `${hash}.${ext}`;

		stream.pipe(profilePicBlobStore.createWriteStream({
			key: req.user.name,
			params: {
				ACL: 'public-read',
				CacheControl: 'max-age=31536000'
			}
		}))
		.on('error', console.error.bind(console))
		.on('finish', async (file) => {
			await um.updateAvatar(req.user.id, `${global.nconf.get('s3:endpoint')}/images-guac/profile-avatars/${id}`);
		})
		return send(res, 200, {
			statusCode: 200,
		});
	}
);