import RootClass from '@src/root_class';
import App from '@src';
import { RESERVED_SKUS, SKU_VITRINA } from '@root/config';
import form from '@helpers/form';
import db from '@helpers/db';

export default class FormData extends RootClass {
	constructor(product) {
		super();
		this.product = product;
	}

	async init() {
		//перед сохранением в БД обновляем данные о товаре на случай dirty-state
		this.product.productData.init();
		return await (this.product.data.artikul.endsWith('v') ? this.productVitrina() : Promise.resolve(this.productNormal()));
	}

	//неоригинальный витринный товар
	//для таких товаров мы только обновляем vitrina_id родительского товара
	async productVitrina() {
		const parent_id = await db.table('products').get({
			fields: ['id'],
			where: {
				sku: this.product.data.sku,
				shop_tilda_id: App.shop.shop_tilda_id
			},
			limit: 1
		});
		return parent_id ? { id: parent_id, vitrina_id: this.product.data.id } : {};
	}

	//оригинальный товар
	productNormal() {
		const $f = this.product.$form;
		const d = this.product.data;
		return {
			id: d.id,
			sku: RESERVED_SKUS.includes(d.sku) ? d.artikul : d.sku,
			vitrina_id: d.sku == SKU_VITRINA ? d.id : $f.find('#vitrina_id').val() || null,
			title: d.title,
			allowed_today: num($f.find('#allowed_today')),
			card_type: val($f.find('#card_type')),
			hidden: check($f.find('#hidden')),
			evkalipt: check($f.find('#evkalipt')),
			fixed_price: check($f.find('#fixed_price')),
			paid_delivery: check($f.find('#paid_delivery')),
			random_sostav: check($f.find('#random_sostav')),
			select_color: check($f.find('#select_color')),
			select_gamma: check($f.find('#select_gamma')),
			days_to_close: num($f.find('#days_to_close')),
			purchase_price: num($f.find('#purchase_price')),
			type: RESERVED_SKUS.includes(d.sku) ? d.sku : val($f.find('#type')) || null,
			date_to_open: val($f.find('#date_to_open')) || null,
			card_content: this.cardContent(),
			photos: this.collectPhotosData(),
			texts: this.collectTextsData(),
			sostav: this.collectVariantsData(),
			...this.collectCharacteristicsData(),
		};
	}

	// Сбор данных о контенте карточки
	cardContent() {
		const $form = this.product.$form;
		switch (this.product.data.card_type) {
			case 'text':
				return $form.find('[value="текст карточки"]')
					.parents('.tstore__edit-properties__header')
					.next()
					.find('textarea')
					.val();
			case 'image':
				return $form.find('.js-gallery-item')
					.eq(1)
					.find('a.js-img-title')
					.attr('href');
			default:
				return '';
		}
	}

	// Сбор данных о фотографиях
	collectPhotosData() {
		const data = [];
		for (const galleryItem of this.product.galleryItems.values()) {
			const url = galleryItem.url;
			const razmer = galleryItem.naphoto.$razmer?.val();
			const doptext = galleryItem.naphoto.$doptext?.val();

			const photo = { url };
			if (razmer) photo.naphoto_razmer = razmer;
			if (doptext) photo.naphoto_doptext = doptext;

			data.push(photo);
		}
		return data;
	}

	// Сбор текстовых данных (короткий текст, длинный текст, "шта?")
	collectTextsData() {
		const $form = this.product.$form;
		const data = {};
		const shortText = val($form.find('[name="descr"]'));
		const longText = val($form.find('[name="text"]'));

		if (shortText) data.short = shortText;
		if (longText) data.long = longText;

		// Обработка специального поля "шта?"
		if (App.shop.title === '2steblya') {
			const shtaCont = $form.find('.js-prod-characteristic:first .js-prod-charact-value');
			if (!shtaCont.length) return;
			const shtaValue = val(shtaCont);
			if (shtaValue) data.shta = shtaValue;
		}
		return data;
	}

	// Сбор данных о разделах, составе, гамме и цвете
	collectCharacteristicsData() {
		const $form = this.product.$form;
		const data = {
			razdel: [],
			sostav: [],
			gamma: [],
			color: []
		};

		//разделы
		$form.find('.tstore_partselector__part-title').each((_, t) => data.razdel.push($(t).text()));

		// состав, гамма, цвет
		const map = {
			'гамма': 'gamma',
			'цвет': 'color',
			'состав': 'sostav'
		};
		$form.find('.tstore__edit-characteristics__item').each((_, el) => {
			const $el = $(el);
			const title = $el.find('.js-prod-charact-title').val();
			const value = $el.find('.js-prod-charact-value').val();
			const key = map[title];
			if (key) data[key].push(value);
		});

		return data;
	}

	// Сбор данных о вариантах товара
	collectVariantsData() {
		const data = [];
		const $variants = this.product.$variants();
		if ($variants.length) {
			$variants.each((_, el) => {
				const $el = $(el);
				data.push({
					artikul: $el.find('[data-field-name="sku"]').val(),
					price: $el.find('[data-field-name="price"]').val(),
					priceold: $el.find('[data-field-name="priceold"]').val(),
					quantity: $el.find('[data-field-name="quantity"]').val(),
					format: $el.find('.tstore__editions-controls__opt-col input').val()
				});
			});
		} else {
			data.push({
				artikul: $.find('[name="sku"]').val(),
				price: $.find('[name="price"]').val(),
				priceold: $.find('[name="priceold"]').val(),
				quantity: $.find('[name="quantity"]').val()
			});
		}
		return data;
	}
}

const val = (e) => form.getValue(e);
const num = (e) => form.getNumberValue(e);
const check = (e) => form.getCheckboxValue(e);