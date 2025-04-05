import Product from '@modules/store/product';
import observers from '@helpers/observers';
import wait from '@helpers/wait';

export default class StoreProducts {
	constructor() {
		this.t = 'td-prod';
		this.observer = observers.store.add('products');
		this.selector = '.js-product:not(.processed)';
	}

	init() {
		this.lastArticle();
		this.uidTh();
		this.listen();
		this.products();
	}

	// инициализирует товары
	async products() {
		const node = await wait.element(this.selector);
		if (!node) throw new Error('Товары не найдены');

		const nodes = document.querySelectorAll(this.selector);
		nodes.forEach(node => new Product(node).init());
	}

	// слушает добавление товаров
	listen() {
		this.observer.setSelector(this.selector).onAdded((node) => new Product(node).init()).start();
	}

	// добавляет заголовок "UID" в колонку
	uidTh() {
		const t = `${this.t}__head`;
		if ($(`.${t}-table .${t}-uid`).length) return;
		$(`.${t}-table .${t}-title`).after(`<td class="${t}-uid">UID</td>`);
	}

	// добавляет блок с последним артикулом
	lastArticle() {
		const cont = $(`<div id="td-lastArticle"><div class="td-store__top-controls-box__wrapper">Последний артикул: <span id="lastArticle">0</span></div></div>`);
		cont.insertBefore($('.td-prod__listbox'));
	}
}
