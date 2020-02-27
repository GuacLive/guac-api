require('@babel/register');
const micro = require('micro');
const index = require('./index');

const server = micro(index);
server.listen(9000);