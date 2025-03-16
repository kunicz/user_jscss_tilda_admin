import * as pages from '@src/pages';
import db from '@helpers/db';
import '@css/all.css';

export let shops = [];
export let shop = {};

window.BUNDLE_VERSION = '2.1.1';

try {
	db.getShops().then(result => {
		shops = result;
		page();
	}).catch(error => {
		console.error(error);
	});
} catch (error) {
	console.error(error);
}

export function page(pageTite = '') {
	if (pageTite) {
		runPage(pageTite);
	} else {
		Object.entries(pages.routes).forEach(async ([title, pattern]) => {
			if (!new RegExp(pattern).test(window.location.href)) return;
			runPage(title);
		});
	}

	async function runPage(title) {
		version();
		console.log(`user_jscss: tilda.ru/${title}`);
		shop = await db.getShop({ shop_tilda_id: window.projectid }) || {};
		if (pages[title]) pages[title]();
	}
}

function version() {
	$(`<div id="bundleVersion">v${window.BUNDLE_VERSION}</div>`).appendTo('body');
}
