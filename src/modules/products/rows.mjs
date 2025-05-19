import RootClass from '@helpers/root_class';
import Product from '@modules/products/row';
import wait from '@helpers/wait';
import dom from '@helpers/dom';

export default class ProductsRows extends RootClass {
	constructor() {
		super();
		this.t = 'td-prod';
		this.observer = this.setObserver();
		this.selector = '.js-product:not(.processed)';
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
		dom(this.selector).forEach(el => this.product(el));
	}

	product(el) {
		new Product(el).init();
	}

	// добавляет заголовок "UID" в колонку
	// если он уже существует, то ничего не делаем
	uidTh() {
		const t = `${this.t}__head`;
		const uidEl = dom(`.${t}-uid`);
		const titleEl = dom(`.${t}-title`);
		if (!uidEl) titleEl.toNext(`<td class="${t}-uid">UID</td>`);
	}

	// добавляет блок с последним артикулом
	// если он уже существует, то ничего не делаем
	lastArtikul() {
		if (dom('body').node('#td-lastArtikul')) return;
		dom(`
		<div id="td-lastArtikul">
			<div class="td-store__top-controls-box__wrapper">
				Последний артикул: <span id="lastArtikul">0</span>
			</div>
		</div>`).prevTo('.td-prod__listbox');
	}
}
