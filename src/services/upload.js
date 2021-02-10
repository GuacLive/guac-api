import multer from 'multer';
import store from 's3-blob-store';
import {Endpoint, S3} from 'aws-sdk';

export default fn => async (req, res) => {
    const multipartMiddleware = multer();
console.log(global.nconf, global.nconf.get('s3:endpoint'),  global.nconf.get('s3:access_key'));
    const s3Endpoints = new Endpoint(global.nconf.get('s3:endpoint'));
    const s3 = new S3({
        accessKeyId: global.nconf.get('s3:access_key'),
        secretAccessKey: global.nconf.get('s3:secret_key'),
        endpoint: s3Endpoints
    });

    const offlineBlobStore = store({
        client: s3,
        bucket: 'images-guac/offline-banners'
    });

    const profilePicBlobStore = store({
        client: s3,
        bucket: 'images-guac/profile-avatars'
    });

    req.s3 = {
        offlineBlobStore,
        profilePicBlobStore
    };

    return multipartMiddleware.single('uri')(await fn(req,res));
}