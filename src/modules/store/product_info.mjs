import { copy } from '@helpers/clipboard';
import wait from '@helpers/wait';
import observers from '@helpers/observers';
import normalize from '@helpers/normalize';
import DBIntegration from '@modules/store/product_info/db_integration';
import { SKU_PODPISKA } from '@root/config';

export default class ProductInfo {
	constructor() {
		this.observer = observers.store.add('product_info');
		this.dbIntegration = new DBIntegration();
		this.data = {};
		this.productDb = null;
		this.$form = null;
		this.$prodEditions = null;
	}

	// если страница открыта с параметром productuid, то сразу обрабатываем форму
	// и в любом случае слушаем появление формы, так как эта сущность динамическая
	async init() {
		if (window.location.search.indexOf('productuid')) await this.initForm();
		this.listen();
	}

	// слушает появление формы
	listen() {
		this.observer.setSelector('.tstore__editbox').onAdded(this.initForm.bind(this)).start();
	}

	// обрабатывает форму
	async initForm() {
		const form = await wait.element('[id^="productform"]');
		if (!form) return;
		if (form.classList.contains('processed')) return false;

		// форма тоже диначески подгружается, поэтому подождем когда подгрузятся варианты
		await wait.element('#product_options_table_box');

		this.$form = $(form);
		this.data = this.getData();
		this.formats = this.getFormats();
		this.$variants = this.getVariants();

		this.articlesTips();
		this.longAndShortText();
		this.dbIntegration.init(this);

		this.$form.addClass('processed');
	}

	// меняем тильдовские заголовки: Описание -> Короткий текст / Текст -> Длинный текст
	async longAndShortText() {
		await wait.halfsec();
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

	// обновляем доступные форматы (букетик, букетусик и пр.)
	updateFormats() {
		this.formats = this.getFormats();
	}

	// получаем доступные форматы (букетик, букетусик и пр.)
	getFormats() {
		const formats = [];
		this.$form.find('.tstore__editions-controls__opt-col input').each((_, node) => formats.push($(node).val()));
		return formats;
	}

	// обновляем варианты товара
	updateVariants() {
		this.$variants = this.getVariants();
	}

	// получаем все варианты товара
	getVariants() {
		return this.$form.find('tr.js-prod-edition');
	}

	// обновляем базовые данные о товаре
	updateData() {
		this.data = this.getData();
	}

	// получаем базовые данные о товаре
	getData() {
		const data = {};
		//id
		data.id = normalize.int(this.$form.attr('id'));

		//title
		data.title = this.$form.find('[name="title"]')?.val();

		//артикул, если товар без вариантов
		data.artikulMain = this.$form.find('[name="sku"]')?.val() || undefined;

		//артикул, если товар с вариантами
		data.artikulVariant = this.$form.find('[data-field-name="sku"]:first')?.val() || undefined;

		// Проверяем, есть ли значение в основном инпуте. Если значение есть, значит, вариантов нет.
		data.hasVariants = !data.artikulMain;

		// Очищаем артикул для получения SKU (только номер)
		data.sku = (data.artikulMain ?? data.artikulVariant).replace(/-.*/, '').replace(/v$/, '').padStart(3, '0');

		//артикул
		data.artikul = ((artikul) => {

			// Если товар — подписка (артикул вида 666-title10x3)
			if (data.hasVariants && data.sku === SKU_PODPISKA) {
				artikul = artikul.replace(/\d+x\d+$/, '');
			}

			return artikul;

		})(data.artikulMain ?? data.artikulVariant);

		return data;
	}

}