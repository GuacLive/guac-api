import { send } from 'micro';
import { compose, parseJSONInput } from 'micro-hoofs';
const { upload, move } = require('micro-upload')

const fs = require('fs');
const stream = require('stream');
const fileType = require('file-type');
const crypto = require('crypto');

const verifyApiKey = require('../../services/verifyApiKey');
const fileModel = require('../../models/file');

const UPLOAD_PATH = global.nconf.get('server:upload_path');
const SERVER_DOMAIN = global.nconf.get('server:domain');
const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

const validMimes = [
	'image/png',
	'image/jpg',
	'image/gif',
	'image/jpeg',
	'text/markdown',
	'text/plain'
];

var getFileInfo = async (data) => {
	var hash = crypto.createHash('sha1');
	if(!data || !data.length){
		return {
			hash: null,
			ext: null,
			mime: null
		};
	}
	var ft = fileType(data);
	if(!ft){
		return {
			hash: null,
			ext: null,
			mime: null
		};
	}
	hash.update(data.toString('binary'));
	return {
		hash: hash.digest('hex'),
		ext: ft.ext,
		mime: ft.mime
	};
};

module.exports = compose(
	parseJSONInput
)(
	upload(
		{
			limits: {
				fileSize: 50 * 1024 * 1024
			}
		},
		verifyApiKey(async (req, res) => {
			if(!UPLOAD_PATH){
				return send(res, 500, {
					statusCode: 500,
					statusMessage: 'Upload path not found'
				});
			}
			if(!req.files){
				return send(res, 400, {
					statusCode: 400,
					statusMessage: 'No file uploaded'
				});
			}

			let file = req.files.file;

			if(!file.data){
				throw new Error('OMG FATAL ERROR SHUTTING DOWN SYSTEM');
				return;
			}

			let fileData = await getFileInfo(file.data),
				hashedFileName = `${fileData.hash}.${fileData.ext}`;
			console.log(fileData, hashedFileName);
			if(!fileData.hash || !validMimes.includes(fileData.mime)){
				return send(res, 415, {
					statusCode: 415,
					statusMessage: 'Invalid file uploaded'
				});
			}

			const username = req.user.name;
			const finalPath = `${UPLOAD_PATH}/${username}`;
			const output = {
				statusCode: 500,
				statusMessage: 'OMG FATAL ERROR SHUTTING DOWN SYSTEM'
			};
			if(username && USERNAME_REGEX.test(req.user.name)){
				/* 
					If path doesn't exist,
					this will throw an exception,
					which then will make a directory
				*/
				try {
					fs.statSync(finalPath);
				} catch(e) {
					fs.mkdirSync(finalPath);
				}
				if(!fs.existsSync(`${finalPath}/${hashedFileName}`)){
					await move(file, `${finalPath}/${hashedFileName}`);
					output.statusCode = 200;
					output.statusMessage = 'upload success';
					await fileModel.insertFile({
						...fileData,
						name: file.name,
						uploader_id: req.user.id
					});
				}else{
					output.statusCode = 200;
					output.statusMessage = 'file already uploaded';
				}
				output.link = `https://${username}.${SERVER_DOMAIN}/${hashedFileName}`;
			}
			
			send(res, output.statusCode, output);
		})
	)
);