import fetch from 'node-fetch';
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