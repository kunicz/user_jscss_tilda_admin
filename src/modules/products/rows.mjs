import RootClass from '@helpers/root_class';
import Product from '@modules/products/row';
import wait from '@helpers/wait';
import { d } from '@helpers/dom';

export default class ProductsRows extends RootClass {
	constructor() {
		super();
		this.t = 'td-prod';
		this.observer = this.setObserver();
		this.selector = '.js-product:not(.processed)';
		this.productsCache = new Map();
	}

	init() {
		this.lastArtikul();
		this.uidTh();
		this.listen();
		this.products();
	}

	// слушает добавление товаров
	listen() {
		this.observer
			.setSelector(this.selector)
			.onAdded((el) => this.product(el))
			.start();
	}

	// инициализирует товары
	async products() {
		await wait.element(this.selector);
		d(this.selector).forEach(el => this.product(el));
	}

	product(el) {
		const product = new Product(el);
		this.productsCache.set(product.id, product);
		product.init();
	}


	// добавляет заголовок "UID" в колонку
	// если он уже существует, то ничего не делаем
	uidTh() {
		const t = `${this.t}__head`;
		if ($(`.${t}-table .${t}-uid`).length) return;

		$(`.${t}-table .${t}-title`).after(`<td class="${t}-uid">UID</td>`);
	}

	// добавляет блок с последним артикулом
	// если он уже существует, то ничего не делаем
	lastArtikul() {
		if (d('body').node('#td-lastArtikul')) return;

		d(`<div id="td-lastArtikul"><div class="td-store__top-controls-box__wrapper">Последний артикул: <span id="lastArtikul">0</span></div></div>`)
			.prevTo('.td-prod__listbox');
	}
}
