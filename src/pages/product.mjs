import RootClass from '@src/root_class';
import { copy } from '@helpers/clipboard';
import DBIntegration from '@modules/product/db_integration';
import ProductData from '@modules/product/product_data';
import FormData from '@modules/product/form_data';
import { $btn } from '@src/utils';

export default class Product extends RootClass {
	static name = 'product';

	constructor() {
		super();
		this.dbIntegration = null;
		this.productData = null;
		this.formData = null;
		this.data = {};
		this.$removeVariantsBtn = $btn.clone();
	}

	async init() {
		this.$form = $('[id^="productform"]');
		this.formData = new FormData(this);
		this.productData = new ProductData(this);
		this.dbIntegration = new DBIntegration(this);

		this.productData.init();
		this.dbIntegration.init();

		console.log(`Загружен продукт ${this.data.title}`, this.data);

		this.articlesTips();
		this.longAndShortText();
		this.removeVariants();
	}

	destroy() {
		this.productData.destroy();
		this.dbIntegration.destroy();
		super.destroy();
	}

	// меняем тильдовские заголовки: Описание -> Короткий текст / Текст -> Длинный текст
	longAndShortText() {
		const $formgroups = this.$form.children('.pe-form-group');
		$formgroups.eq(1).children('.pe-label').text('Короткий текст');
		$formgroups.eq(2).children('.pe-label').text('Длинный текст');
	}

	// добавляем блок с подсказками к буквенным идентификаторам для sku
	articlesTips() {
		const disclaimer = $('<div class="pe-hint skuDisclaimer"></div>');
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
			const span = $(`<span>${name}&nbsp;(<b>${letter}</b>)</span>`);
			span.appendTo(disclaimer).on('click', () => copy(span.children('b').text()));
		});
		disclaimer.insertBefore(this.$form.find('#product_options_table_box'));
	}

	// возвращает все варианты товара (букетик, букетусик и пр.)
	$variants() {
		return this.$form.find('.tstore__editions-controls__opt-col input');
	}

	// удаляет варианты товара
	removeVariants() {
		const cb = () => {
			const $variants = this.$variants();
			if ($variants.length < 2) return;

			$variants.each((i, variant) => {
				if (i === 0) return;
				$(variant).parent().siblings().last().children('button').get(0).dispatchEvent(new MouseEvent('click', {
					bubbles: true,
					cancelable: true,
					view: window
				}));
			});
		};

		this.$removeVariantsBtn.text('Удалить варианты');
		this.$removeVariantsBtn.appendTo($('.tstore_variants__btns')).on('click', cb);
	}
}