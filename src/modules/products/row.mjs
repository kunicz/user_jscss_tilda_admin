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
		this.id = this.el.data('store-product-uid');
		this.title = this.el.node(`.${this.t}td-title__btn`).txt();
		this.artikul = null;
		this.lastArtikul = dom('#lastArtikul');
		this.isVitrina = false;
	}

	init() {
		if (this.el.is('.processed')) return;
		this.uidTd();
		this.processArtikul();
		this.el.addClass('processed');
	}

	// добавляем ячейку в столбец uid
	uidTd() {
		copyBtn(ensure.string(this.id))
			.nextTo(this.el.node(`.${this.t}td-title`))
			.wrap(`<td class="${this.t}uid"></td>`);
	}

	// определяем артикул по sku
	async processArtikul() {
		const variants = this.el.nodes(`.${this.t}variants-expand`);
		if (!variants.length) {
			this.processSku(this.el.node(`.${this.t}sku`).txt());
			return;
		}
		variants.forEach(async btn => {
			btn.trigger('click');
			await wait.check(() => !!this.el.child('.js-edition'));
			this.processSku(this.el.child('.js-edition').node(`.${this.t}sku`).txt());
			btn.trigger('click');
		});
	}

	//обрабатываем sku
	processSku(sku) {
		this.isVitrina = sku.at(-1) === 'v' || sku.startsWith(ARTIKUL_VITRINA);
		this.artikul = sku.split('-')[0];

		this.defineLastArtikul();
		this.drawArtikul();
		this.markVitrina();
	}

	// устанавливаем последний артикул, если текущий артикул больше последнего
	// RESERVED_ARTIKULS в рассчете не участвуют
	defineLastArtikul() {
		if (RESERVED_ARTIKULS.includes(String(this.artikul))) return;
		const cur = ensure.int(this.lastArtikul.txt());
		if (cur < this.artikul) this.lastArtikul.txt(this.artikul);
	}

	// выводим артикул в таблицу
	drawArtikul() {
		this.el.node(`.${this.t}sku`).txt(this.artikul + (this.isVitrina && this.artikul.at(-1) !== 'v' ? 'v' : ''));
	}

	// подстветим витринные товары
	markVitrina() {
		if (this.isVitrina) this.el.addClass('vitrina');
	}
}