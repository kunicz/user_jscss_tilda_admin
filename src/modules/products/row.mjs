import RootClass from '@src/root_class';
import { copy } from '@helpers/clipboard';
import wait from '@helpers/wait';
import normalize from '@helpers/normalize';
import { RESERVED_SKUS } from '@root/config';

export default class ProductsRow extends RootClass {
	constructor(node) {
		super();
		this.$ = $(node);
		this.t = 'td-prod__';
		this.id = this.getId();
		this.title = this.getTitle();
		this.sku = this.getSku();
		this.article = this.getArticle(this.sku);
		this.$lastArticle = $('#lastArticle');
	}

	init() {
		if (this.$.is('.processed')) return;

		this.processArticle();
		this.uidTd();
		this.variants();

		this.$.addClass('processed');
	}

	// обрабатываем артикул
	processArticle() {
		if (!this.article) return;

		this.padArticle();
		this.lastArticle();
	}

	// меняем артикул на 3-х значный
	padArticle() {
		const pad = String(this.article).padStart(3, '0');
		this.$.find(`.${this.t}sku`).text(pad);
	}

	// устанавливаем последний артикул, если текущий артикул больше последнего
	lastArticle() {
		if (!this.$lastArticle.length) return;
		if (RESERVED_SKUS.includes(String(this.article))) return;

		const last = normalize.int(this.$lastArticle.text());
		if (last < this.article) this.$lastArticle.text(this.article);
	}

	// добавляем ячейку в столбец uid
	uidTd() {
		$(`<a href="#">${this.id}</a>`)
			.on("click", (e) => {
				e.preventDefault();
				copy(String(this.id));
			})
			.wrap(`<td class="${this.t}uid"></td>`)
			.parent()
			.insertAfter(this.$.find(`.${this.t}td-title`));
	}

	// обрабатываем варианты товара
	async variants() {
		if (this.article) return;

		const $expandBtn = this.$.find(`.${this.t}variants-expand`);
		if (!$expandBtn.length) return;

		$expandBtn.trigger('click');

		const checkResult = await wait.check(() => this.$.children('.js-edition').length);
		if (!checkResult) throw new Error('Не удалось дождаться появления вариантов товара');

		// обрабатываем артикул
		this.article = this.getArticle(this.$.children('.js-edition').eq(0).find(`.${this.t}sku`).text());
		this.processArticle();

		$expandBtn.trigger('click');
	}


	getTitle() {
		return this.$.find(`.${this.t}td-title__btn`).text().trim();
	}

	getId() {
		return this.$.data('store-product-uid');
	}

	getSku() {
		return this.$.find(`.${this.t}sku`).text().trim();
	}

	getArticle(str) {
		return normalize.int(str.replace(/\-.+/, ''));
	}
}