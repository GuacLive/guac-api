import fetch from 'node-fetch';
import stream from 'stream';
const { Duplex } = stream;
const crypto = require('crypto');
const timeoutSignal = require('timeout-signal');
export const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const reservedUsernames = [
	'ninja',
	'drdisrespect',
	'drdisrespectlive',
	'kinggothalion',
	'shroud',
	'tfue',
	'nickmercs',
	'pokimane',
	'drlupo',
	'tsm_daequan',
	'summit1g',
	'timthetatman',
	'dakotaz',
	'myth',
	'loltyler1',
	'iceposeidon',
	'sodapoppin',
	'mystixx',
	'realstiannorway',
	'stiannorway',
	'binci',
	'tappelino',
	'amouranth',
	'asmongold',
	"forsen",
	"yaklama",
	"streamelements",
	"streamlabs",
	'fortnite',
	'nintendo',
	'sony',
	'microsoft',
	'admin',
	'staff',
	'mod',
	'guac',
	'datagutt',
	'kinggothalion',
	'alinity',
	'privacy',
	'tos',
	'help',
	'unfollow',
	'unsubscribe',
	'c',
	'category',
	'embed',
	'overlay',
	'_next',
	'css',
	'javascript',
	'static',
	'api',
	'oauth',
	'patreon',
	'auth'
];
export const isReservedUsername = (username) => {
	if(!username) return false;
	const normalized = username.toLowerCase();
	// Check if username is in reserved array
	return reservedUsernames.indexOf(normalized) !== -1;
};
export const getFromViewerAPI = (name) => {
	return new Promise((resolve, reject) => {
		fetch(`${global.nconf.get('server:viewer_api_url')}/viewers/${name}`, {
			signal: timeoutSignal(5000)
		})
		.then(r => r.json())
		.then(response => {
			resolve(response && response.viewers ? response.viewers : 0);
		})
		.catch(error => {
			resolve(0);
		});
	})
}
export function promisify(func) {
    // promisified is a class with promisified methods.
    // func is a conventional Node.js API function. The last 
    // argument is a callback function.
    return function promisified(arg) {
        // The return object is a Promise<A> instance.
        // This instance will use resolve and reject to implement the callback functionality
        // in func. 
        // func will still be applied, and the callback will still be called. But the 
        // callback function will be composited from resolve and reject.
        return new Promise(function (resolve, reject) {
            func.apply(null, [arg, function (err, res) {
                    if (err)
                        reject(err);
                    else
                        resolve(res);
                }]);
        });
    };
}

export const bufferToHash = function bufferToHash(buffer) {
	const hash = crypto.createHash('sha256');
	hash.update(buffer);
	return hash.digest('hex');
};

export const bufferToStream = function bufferToStream(buffer) {
	const duplexStream = new Duplex();
	duplexStream.push(buffer);
	duplexStream.push(null);
	return duplexStream;
  }
  