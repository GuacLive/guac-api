import { send,json } from 'micro';
import { compose } from 'micro-hoofs';

import streamModel from '../../models/stream';

import verifyJWTKey from '../../services/verifyJWTKey';

module.exports = compose(
	verifyJWTKey
)(
	async (req, res) => {
		const stream = new streamModel;
		const jsonData = await json(req);
		if(jsonData && jsonData.description){
			let panel;
			let userId = req.user.id;
			let panel_id = jsonData.panel_id;
			let title = jsonData.title;
			let description = jsonData.description;
			// If panel is already in database, update it
			if(panel_id && (panel = await stream.getPanel(panel_id))){
				if(panel.user_id === userId){
					if(jsonData.delete){
						await stream.deletePanel(parseInt(panel_id, 10));
						return send(res, 200, {
							statusCode: 200,
							statusMessage: 'Panel deleted'
						});
					}else{
						await stream.setPanel(parseInt(panel_id, 10), title, description);
						return send(res, 200, {
							statusCode: 200,
							statusMessage: 'Panel updated'
						});
					}
				}else{
					return send(res, 401, {
						statusCode: 401,
						statusMessage: 'This is not your panel'
					});
				}
			}else{
				await stream.addPanel(
					title,
					description,
					userId
				);
				return send(res, 200, {
					statusCode: 200,
					statusMessage: 'Panel updated'
				});
		}
		}else{
			return send(res, 400, {
				statusCode: 400,
				statusMessage: 'No title and description provided'
			});
		}
	}
);