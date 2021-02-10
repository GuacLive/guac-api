import { send } from 'micro';
import { compose } from 'micro-hoofs';

const fs = require('fs').promises;

import userModel from '../../models/user';
import verifyJWTKey from '../../services/verifyJWTKey';
import uploadService from '../../services/upload';
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
        if(!req.s3 || !req.file || !req.file.stream){
			return send(res, 400, {
				statusCode: 400,
			});
        }
        const { profilePicBlobStore } = req.s3;
        console.log('profilePicBlobStore', profilePicBlobStore);
        
        req.file.stream.pipe(profilePicBlobStore.createWriteStream({
            key: req.user.name,
            params: {
                ACL: 'public-read',
                CacheControl: 'max-age=31536000'
            }
        }))
        .on('error', console.error.bind(console))
        .on('finish', async (file) => {
            console.log('finish', file);
            await um.updateAvatar(req.user.id, `${global.nconf.get('s3:endpoint')}/images-guac/profile-avatars/${file.key}`);
        })
		return send(res, 200, {
			statusCode: 200,
		});
	}
);