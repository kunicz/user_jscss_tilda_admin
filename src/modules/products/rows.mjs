import RootClass from '@src/root_class';
import Product from '@modules/products/row';
import observers from '@helpers/observers';
import wait from '@helpers/wait';

export default class ProductsRows extends RootClass {
	constructor() {
		super();
		this.t = 'td-prod';
		this.observer = observers.add('products', 'rows');
		this.selector = '.js-product:not(.processed)';
		this.productsCache = new Map();
		this.$lastArticle = null;
	}

	init() {
		this.lastArticle();
		this.uidTh();
		this.listen();
		this.products();
	}

	destroy() {
		this.productsCache.forEach(product => product.destroy());
		this.productsCache.clear();
		super.destroy();
	}

	// слушает добавление товаров
	listen() {
		this.observer
			.setSelector(this.selector)
			.onAdded((node) => this.product(node))
			.start();
	}

	// инициализирует товары
	async products() {
		const node = await wait.element(this.selector);
		if (!node) throw new Error('Товары не найдены');

		const nodes = document.querySelectorAll(this.selector);
		nodes.forEach(node => this.product(node));
	}

	product(node) {
		const product = new Product(node);
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
	lastArticle() {
		if ($('body').find('#td-lastArticle').length) return;

		const cont = $(`<div id="td-lastArticle"><div class="td-store__top-controls-box__wrapper">Последний артикул: <span id="lastArticle">0</span></div></div>`);
		cont.insertBefore($('.td-prod__listbox'));
	}
}
