import * as Page from '../classes/Page.js';

export function page() {

	if (window.location.pathname != '/page/') return;
	if (!window.projectIds.includes(window.projectid.toString())) return;

	console.log('user_jscss : tilda.ru/page');

	Page.frontendStylesInAdmin();

}