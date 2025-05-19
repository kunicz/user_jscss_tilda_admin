import RootClass from '@helpers/root_class';
import Page from '@pages/page';
import Product from '@pages/product';
import Products from '@pages/products';
import Project from '@pages/project';
import Projects from '@pages/projects';
import db from '@helpers/db';
import dom from '@helpers/dom';
import wait from '@helpers/wait';
import '@css/all.css';

window.BUNDLE_VERSION = '3.0.1';

export default class App extends RootClass {
	static shop = null;
	static shops = null;
	static page = null;
	static href = null;

	async init() {
		await App.setShops();
		await this.initPage();
		this.listen();
		this.version();
	}

	//слушает изменения в url
	listen() {
		['pushState', 'replaceState'].forEach(methodName => {
			// Сохраняем оригинальную функцию history.pushState или history.replaceState
			const originalMethod = history[methodName];

			// Переопределяем метод
			history[methodName] = function (...args) {
				// Вызываем оригинальный метод с теми же аргументами
				const result = originalMethod.apply(this, args);

				// Создаём и выбрасываем пользовательское событие
				const event = new Event(methodName);
				window.dispatchEvent(event);

				// Возвращаем результат, чтобы ничего не сломать
				return result;
			};
		});
		['popstate', 'pushState', 'replaceState'].forEach(e => window.addEventListener(e, this.initPage));
	}

	//инициализирует модуль страницы
	async initPage() {
		// нужно удостовериться, что url действительно изменился, чтоб не инициализировать несколько инстансов модуля
		if (App.href == window.location.href) return;
		App.href = window.location.href;

		const pages = new Map([
			[/page/, Page],
			[/store\/(?!.*productuid=)/, Products],
			[/store\/\?.*productuid=/, Product],
			[/projects\/\?/, Project],
			[/projects\/$/, Projects]
		]);
		for (const [pattern, page] of pages) {
			if (!pattern.test(window.location.href)) continue;

			await wait.halfsec();

			// выводит в консоль имя модуля
			console.log(`user_jscss : tilda_admin/${page.name}`);

			// уничтожает предыдущий модуль
			if (App.page) App.page.destroy?.();

			// создает новый модуль
			App.setShop();
			App.page = new page();

			// инициализирует модуль
			await Promise.resolve(App.page.init());
		}
	}

	//добавляет вирсию бандла
	version() {
		dom(`<div id="bundleVersion">v${window.BUNDLE_VERSION}</div>`).lastTo('body');
	}

	//дополняет массив проектов из тильды данными из базы
	static async setShops() {
		const shops = await db.table('shops').get();
		const projects = window.projects;
		if (!projects) {
			App.shops = shops;
		} else {
			App.shops = projects
			App.shops.forEach(project => {
				const shop = shops.find(shop => shop.shop_tilda_id == project.id);
				Object.assign(project, shop);
			});
		}
	}

	//устанавливает магазин
	static setShop() {
		App.shop = App.shops.find(shop => shop.shop_tilda_id == (window.project?.id || window.projectid));
	}
}

try { new App().init(); } catch (error) { console.error(error); }