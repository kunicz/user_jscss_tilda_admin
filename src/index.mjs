import Page from '@pages/page';
import Product from '@pages/product';
import Products from '@pages/products';
import Project from '@pages/project';
import Projects from '@pages/projects';
import db from '@helpers/db';
import is from '@helpers/is';
import wait from '@helpers/wait';

import observers from '@helpers/observers';
import intervals from '@helpers/intervals';
import timeouts from '@helpers/timeouts';

import '@css/all.css';

window.BUNDLE_VERSION = '2.2.0';

export default class App {
	static shop = null;
	static shops = null;
	static module = null;
	static href = null;

	async init() {
		await App.setShops();
		await this.initJquery();
		await this.initModule();
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
		['popstate', 'pushState', 'replaceState'].forEach(e => window.addEventListener(e, this.initModule));
	}

	//инициализирует модуль страницы
	async initModule() {
		// нужно удостовериться, что url действительно изменился, чтоб не инициализировать несколько инстансов модуля
		if (App.href == window.location.href) return;
		App.href = window.location.href;

		const modules = new Map([
			[/page/, Page],
			[/store\/(?!.*productuid=)/, Products],
			[/store\/\?.*productuid=/, Product],
			[/projects\/\?/, Project],
			[/projects\/$/, Projects]
		]);
		for (const [pattern, module] of modules) {
			if (!pattern.test(window.location.href)) continue;

			await wait.halfsec();

			// выводит в консоль имя модуля
			console.log(`user_jscss : tilda_admin/${module.name}`);

			// уничтожает предыдущий модуль
			if (App.module) {
				observers.clear(App.module.constructor.name);
				intervals.clear(App.module.constructor.name);
				timeouts.clear(App.module.constructor.name);
				App.module.destroy?.();
			}

			// создает новый модуль
			App.setShop();
			App.module = new module();

			// инициализирует модуль
			await Promise.resolve(App.module.init());
		}
	}

	//инициализирует jquery
	async initJquery() {
		return new Promise((resolve, reject) => {
			if (!is.undefined(window.jQuery)) return resolve();

			const script = document.createElement('script');
			script.src = 'https://code.jquery.com/jquery-1.10.2.min.js';
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	//добавляет вирсию бандла
	version() {
		$(`<div id="bundleVersion">v${window.BUNDLE_VERSION}</div>`).appendTo('body');
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