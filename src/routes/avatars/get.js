import { send } from 'micro';
import { compose } from 'micro-hoofs';

const fs = require('fs').promises;

import userModel from '../../models/user';

const sendFile = async (file, res) => {
    console.log(`${global.nconf.get('base_dir')}/../public/avatars/${file}`);
    let data = await fs.readFile(`${global.nconf.get('base_dir')}/../public/avatars/${file}`, 'binary');
    res.setHeader('Content-Type', `image/png; charset=utf-8`);
    return send(res, data ? 200 : 404, data ? new Buffer(data) : '')
};

module.exports = compose(
)(
	async (req, res) => {
		if(!req.params.id){
            return send(res, 404);
        }
        if(req.params.id === 'unknown'){
            return await sendFile('unknown.png', res);
        }
		const user = new userModel;
		const result = await user.getUserById(req.params.id.replace('.png', ''));
		console.log(req.params, result);
		if(result && result.id){
            let asset = `${result.id}.png`;
            return await sendFile(asset, res);
        }else{
			return send(res, 404);
		}
	}
);