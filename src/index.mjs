import BundleLoader from '@bundle_loader';
import Page from '@pages/page';
import Store from '@pages/store';
import Project from '@pages/project';
import Projects from '@pages/projects';
import db from '@helpers/db';
import is from '@helpers/is';
import '@css/all.css';

window.BUNDLE_VERSION = '2.1.6';

export default class App {
	static shops = null;
	static shop = null;
	static project = null;

	static async init() {
		await self.initShops();
		self.initProject();
		self.initShop();
		await self.initJquery();
		self.initModule();
		BundleLoader.version().appendTo('body');
	}

	//инициализирует модуль страницы
	static async initModule() {
		BundleLoader.init('tilda_admin', new Map([
			[/page/, new Page()],
			[/store/, new Store()],
			[/projects\/\?/, new Project()],
			[/projects\/$/, new Projects()]
		]));
	}

	//инициализирует jquery
	static async initJquery() {
		return new Promise((resolve, reject) => {
			if (!is.undefined(window.jQuery)) return resolve();

			const script = document.createElement('script');
			script.src = 'https://code.jquery.com/jquery-1.10.2.min.js';
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	//получает все магазины из бд
	static async initShops() {
		if (self.shops?.length) return;
		const shops = await db.table('shops').get();
		self.shops = shops;
	}

	//получает магазин по id проекта
	static initShop() {
		self.shop = self.getShops().find(shop => shop.shop_tilda_id == self.getProject().id);
	}

	//инициализирует проект
	static initProject() {
		self.project = {
			id: window.projectid,
			title: window.projecttitle,
		};
	}

	//получает все магазины
	static getShops() {
		if (!self.shops) self.initShops();
		return self.shops;
	}

	//получает магазин
	static getShop() {
		if (!self.shop) self.initShop();
		return self.shop;
	}

	//получает проект
	static getProject() {
		if (!self.project) self.initProject();
		return self.project;
	}
}

const self = App;
try {
	App.init();
} catch (error) {
	console.error(error);
}