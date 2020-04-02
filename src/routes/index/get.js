const { send } = require('micro');
const { compose } = require('micro-hoofs');

module.exports = compose(
)(async (req, res) => {
    return send(res, 200, {
        healthy: true,
        version: process.env.npm_package_version
    });
});