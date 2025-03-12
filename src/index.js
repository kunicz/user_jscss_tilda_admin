import * as pages from './pages/index.js';
import db from '@helpers/db';

export let shops = [];
export let shop = {};

window.BUNDLE_VERSION = '2.1.0';

$(document).ready(async () => {
	try {
		shops = await db.getShops();
		page();
	} catch (error) {
		console.error(error);
	}
});

export function page(pageTite) {
	if (pageTite) {
		runPage(pageTite);
	} else {
		Object.entries(pages.routes).forEach(async ([title, pattern]) => {
			if (!new RegExp(pattern).test(window.location.href)) return;
			runPage(title);
		});
	}

	async function runPage(title) {
		console.log(`user_jscss: tilda.ru/${title}`);
		shop = await db.getShop({ shop_tilda_id: window.projectid }) || {};
		if (pages[title]) pages[title]();
	}
}