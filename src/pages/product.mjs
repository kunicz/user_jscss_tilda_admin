import RootClass from '@helpers/root_class';
import DBIntegration from '@modules/product/db_integration';
import ProductData from '@modules/product/product_data';
import selectors from '@modules/product/selectors';
import dom from '@helpers/dom';
import { copy } from '@helpers/clipboard';
import { btn } from '@src/utils';

export default class Product extends RootClass {
	static name = 'product';

	constructor() {
		super();
		this.form = dom(selectors.form);
		this.DBIntegration = null;
		this.ProductData = null;
	}

	init() {
		this.ProductData = new ProductData(); this.ProductData.init();
		this.DBIntegration = new DBIntegration(); this.DBIntegration.init();

		console.log(`Загружен продукт ${this.form.data('title')}`, this.form.data());

		this.articlesTips();
		this.longAndShortText();
		this.removeVariants();
	}

	// меняем тильдовские заголовки: Описание -> Короткий текст / Текст -> Длинный текст
	longAndShortText() {
		const els = this.form.childs(selectors.group);
		els[1].child('.pe-label').txt('Короткий текст');
		els[2].child('.pe-label').txt('Длинный текст');
	}

	// добавляем блок с подсказками к буквенным идентификаторам для sku
	articlesTips() {
		const disclaimer = dom('<div class="pe-hint skuDisclaimer"></div>');
		const spans = {
			'букеты': '',
			'коробки': 'x',
			'корзины': 'b',
			'пакет': 'p',
			'кастрюли': 'q',
			'горшки': 'g',
			'ящики': 'y',
			'сердца': 'h',
			'тыквы': 't',
			'елки': 'e',
			'венок': 'w',
			'витрина': 'v'
		};
		Object.entries(spans).forEach(([name, letter]) => {
			const el = dom(`<span>${name}&nbsp;(<b>${letter}</b>)</span>`);
			el.lastTo(disclaimer).listen('click', () => copy(el.childs('b').txt()));
		});
		disclaimer.prevTo(this.form.node('#product_options_table_box'));
	}

	// удаляет варианты товара
	removeVariants() {
		const cb = () => {
			const variants = dom(selectors.variant);
			if (variants.length < 2) return;
			variants.forEach((el, i) => {
				if (i === 0) return;
				el.parent().nextAll().at(-1).child('button').trigger('click');
			});
		};
		btn.clone().txt('Удалить варианты').lastTo('.tstore_variants__btns').listen('click', cb);
	}
}