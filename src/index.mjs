import { init as loadPage, bundleVersion } from '@bundle_loader';
import page from '@pages/page';
import store from '@pages/store';
import project from '@pages/project';
import projects from '@pages/projects';
import db from '@helpers/db';
import '@css/all.css';

export let shops = [];
export let shop = {};
export const initPage = () => {
	loadPage('tilda_admin', new Map([
		[/page/, { page }],
		[/store/, { store }],
		[/projects\/\?/, { project }],
		[/projects\/$/, { projects }]
	]));
	bundleVersion().appendTo('body');
}

window.BUNDLE_VERSION = '2.1.4';

try {
	typeof jQuery !== 'undefined' ? init() : jqueryInit();
} catch (error) {
	console.error(error);
}

async function init() {
	shops = await db.getShops();
	shop = await db.getShop({ shop_tilda_id: window.projectid }) || {};
	initPage();
}

function jqueryInit() {
	const script = document.createElement('script');
	script.src = 'https://code.jquery.com/jquery-1.10.2.min.js';
	script.onload = initTilda();
	document.head.appendChild(script);
}
