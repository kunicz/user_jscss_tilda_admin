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

window.BUNDLE_VERSION = '2.1.5';

try {
	typeof jQuery !== 'undefined' ? init() : jqueryInit();
} catch (error) {
	console.error(error);
}

async function init() {
	if (!window.projectid) {
		await new Promise(resolve => setTimeout(resolve, 100));
		if (!window.projectid) return;
	}

	shops = await db.table('shops').get();
	shop = shops.find(shop => Number(shop.shop_tilda_id) === Number(window.projectid));
	initPage();
}

function jqueryInit() {
	const script = document.createElement('script');
	script.src = 'https://code.jquery.com/jquery-1.10.2.min.js';
	script.onload = async () => await init();
	document.head.appendChild(script);
}
