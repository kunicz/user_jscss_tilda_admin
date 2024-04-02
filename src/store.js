import * as Products from './classes/Products.js';
import * as Product_info from './classes/Product_info.js';
import './css/store.css';

export function store() {

	if (window.location.host != 'store.tilda.ru') return;
	if (!window.projectIds.includes(window.projectid.toString())) return;

	console.log('user_jscss : store.tilda.ru');

	Products.listen();
	Products.uidTh();
	Products.lastArticle();
	Product_info.listen();

}