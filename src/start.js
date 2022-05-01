require('@babel/register');
const http = require('http');
const micro = require('micro');
const index = require('./index');

BigInt.prototype.toJSON = function () {
	return Number(this);
};


const server = new http.Server(micro(index));
server.listen(9000);