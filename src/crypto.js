import {randomBytes} from 'crypto';
import * as pem from 'pem';
import {promisify} from './utils';

let PRIVATE_RSA_KEY_SIZE = 2048

const randomBytesPromise = promisify(randomBytes)
const createPrivateKey = promisify(pem.createPrivateKey)
const getPublicKey = promisify(pem.getPublicKey)
export async function createPrivateAndPublicKeys(){
	const {key} = await createPrivateKey(PRIVATE_RSA_KEY_SIZE)
	const {publicKey} = await getPublicKey(key)

	return {privateKey: key, publicKey}
}

export function setAsyncActorKeys(actor){
	const userModel = require('./models/user').default;
	return createPrivateAndPublicKeys()
		.then(async ({publicKey, privateKey}) => {
			console.log(publicKey, privateKey, actor);
			const u = new userModel;
			actor.publicKey = publicKey;
			actor.privateKey = privateKey;
			await u.updateKeys(actor.username, actor.publicKey, actor.privateKey);
			return actor;
		})
		.catch(err => {
			console.error(err);
			return actor
		})
}