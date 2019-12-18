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
	'asmongold',
	'fortnite',
	'nintendo',
	'sony',
	'microsoft',
	'admin',
	'staff',
	'mod',
	'guac',
	'datagutt'
];
export const isReservedUsername = (username) => {
	if(!username) return false;
	const normalized = username.toLowerCase();
	// Check if username is in reserved array
	return reservedUsernames.indexOf(normalized) !== -1;
};