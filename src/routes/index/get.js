const { send } = require('micro');
const { compose, respondToLivenessProbe } = require('micro-hoofs');

module.exports = compose(respondToLivenessProbe)();