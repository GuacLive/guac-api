import { send } from 'micro';
import { compose } from 'micro-hoofs';

const fs = require('fs').promises;

import userModel from '../../models/user';

const sendFile = (asset, res) => {
    let asset = await fs.readFile(`${global.nconf.get('base_dir')}/public/avatars/${asset}`, 'binary');
    res.setHeader('Content-Type', `image/png; charset=utf-8`);
    return send(res, asset ? 200 : 404, asset ? new Buffer(data) : new Buffer())
};

module.exports = compose(
)(
	async (req, res) => {
		if(!req.params.id){
            return send(res, 404, new Buffer());
        }
        if(req.params.id === 'unknown'){
            return sendFile('unknown.png', res);
        }
		const user = new userModel;
		const result = await user.getUserById(req.params.id);
		console.log(req.params, result);
		if(result && result.id){
            let asset = `${result.id}.png`;
            return sendFile(asset, res);
        }else{
			return send(res, 404, new Buffer());
		}
	}
);