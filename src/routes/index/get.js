const { send } = require('micro');
const { compose } = require('micro-hoofs');
const version = require('../../../package.json').version;
module.exports = compose(
)(async (req, res) => {
    return send(res, 200, {
        healthy: true,
        version: version ? version : process.env.npm_package_version,
        statusCode: 200
    });
});