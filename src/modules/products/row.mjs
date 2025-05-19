import RootClass from '@helpers/root_class';
import copyBtn from '@helpers/clipboard';
import dom from '@helpers/dom';
import wait from '@helpers/wait';
import ensure from '@helpers/ensure';
import { RESERVED_ARTIKULS, ARTIKUL_VITRINA } from '@root/config';

export default class ProductsRow extends RootClass {
	constructor(el) {
		super();
		this.el = dom(el);
		this.t = 'td-prod__';
		this.id = this.getId();
		this.title = this.getTitle();
		this.artikul = null;
		this.lastArtikul = dom('#lastArtikul');
		this.isVitrina = false;
	}

	init() {
		if (this.el.is('.processed')) return;
		this.uidTd();
		this.defineArtikul();
		this.markVitrina();
		this.el.addClass('processed');
	}

	// добавляем ячейку в столбец uid
	uidTd() {
		copyBtn(ensure.string(this.id))
			.nextTo(this.el.node(`.${this.t}td-title`))
			.wrap(`<td class="${this.t}uid"></td>`);
	}

	// устанавливаем последний артикул, если текущий артикул больше последнего
	// RESERVED_ARTIKULS в рассчете не участвуют
	defineLastArtikul() {
		if (RESERVED_ARTIKULS.includes(String(this.artikul))) return;
		const cur = ensure.int(this.lastArtikul.txt());
		if (cur < this.artikul) this.lastArtikul.txt(this.artikul);
	}

	// определяем артикул по sku
	async defineArtikul() {
		const processArtikul = (sku) => {
			this.isVitrina = sku.at(-1) === 'v' || sku.startsWith(ARTIKUL_VITRINA);
			this.artikul = this.getArtikul(sku);
			this.processArtikul();
		}
		const variants = this.el.nodes(`.${this.t}variants-expand`);
		if (!variants.length) {
			const sku = this.el.node(`.${this.t}sku`).txt();
			processArtikul(sku);
			return;
		}
		variants.forEach(async btn => {
			btn.trigger('click');
			await wait.check(() => !!this.el.child('.js-edition'));
			const sku = this.el.child('.js-edition').node(`.${this.t}sku`).txt();
			processArtikul(sku);
			btn.trigger('click');
		});
	}

	// обрабатываем артикул
	processArtikul() {
		this.defineLastArtikul();
		const artikul = (this.artikul + (this.isVitrina && this.artikul.at(-1) !== 'v' ? 'v' : ''));
		this.el.node(`.${this.t}sku`).txt(artikul);
	}

	// подстветим витринные товары
	markVitrina() {
		if (this.isVitrina) this.el.addClass('vitrina');
	}

	getTitle() {
		return this.el.node(`.${this.t}td-title__btn`).txt();
	}

	getId() {
		return this.el.data('store-product-uid');
	}

	getArtikul(sku) {
		return sku?.split('-')[0];
	}
}