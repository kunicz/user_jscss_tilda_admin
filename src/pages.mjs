import page from '@pages/page.mjs';
import store from '@pages/store.mjs';
import project from '@pages/project.mjs';
import projects from '@pages/projects.mjs';
import db from "@helpers/db.mjs";
import { shop } from '@src';

const pages = { page, store, project, projects };
const routes = {
	page: /page/,
	store: /store/,
	project: /projects\/\?/,
	projects: /projects\/$/,
}

export default (pageTite = '') => {
	if (pageTite) {
		page(pageTite);
	} else {
		Object.entries(routes).forEach(async ([title, pattern]) => {
			if (!new RegExp(pattern).test(window.location.href)) return;
			page(title);
		});
	}

	async function page(title) {
		$(`<div id="bundleVersion">v${window.BUNDLE_VERSION}</div>`).appendTo('body');
		console.log(`user_jscss: tilda.ru/${title}`);
		shop = await db.getShop({ shop_tilda_id: window.projectid }) || {};
		if (routes[title]) pages[title]();
	}
}