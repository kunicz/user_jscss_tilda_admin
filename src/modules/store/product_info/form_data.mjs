import App from '@src';
import { RESERVED_SKUS, SKU_VITRINA } from '@root/config';
import form from '@helpers/form';

export default class FormData {
	constructor(Product) {
		this.Product = Product;
		this.$form = this.Product.$form;
		this.productDb = this.Product?.productDb || {};

		//перед сохранением в БД обновляем данные о товаре на случай dirty-state
		this.Product.updateData();

		this.id = this.Product.data.id;
		this.title = this.Product.data.title;
		this.sku = this.Product.data.sku;
		this.artikul = this.Product.data.artikul;
		this.galleryItems = this.Product.galleryItems;

		this.data = {};
	}

	async init() {
		await (this.artikul.endsWith('v') ? this.productVitrina() : Promise.resolve(this.productNormal()));
		return this;
	}

	// получаем полные данные из формы для сохранения в БД
	get() {
		return this.data;
	}

	//неоригинальный витринный товар
	//для таких товаров мы только обновляем vitrina_id родительского товара
	async productVitrina() {
		this.productDb.id = await db.table('products').get({
			fields: ['id'],
			where: {
				sku: this.sku,
				shop_tilda_id: App.getProject().id
			},
			limit: 1
		});
		if (this.productDb.id) {
			this.data.vitrina_id = this.productDb.id;
		}
	}

	//оригинальный товар
	productNormal() {
		this.data.sku = RESERVED_SKUS.includes(this.sku) ? this.artikul : this.sku;
		this.data.vitrina_id = this.data.sku == SKU_VITRINA ? this.data.id : this.$form.find('#vitrina_id').val() || null;
		this.data.title = this.title;
		this.data.allowed_today = form.getNumberValue(this.$form.find('#allowed_today'));
		this.data.card_type = form.getValue(this.$form.find('#card_type'));
		this.data.hidden = form.getCheckboxValue(this.$form.find('#hidden'));
		this.data.evkalipt = form.getCheckboxValue(this.$form.find('#evkalipt'));
		this.data.fixed_price = form.getCheckboxValue(this.$form.find('#fixed_price'));
		this.data.paid_delivery = form.getCheckboxValue(this.$form.find('#paid_delivery'));
		this.data.random_sostav = form.getCheckboxValue(this.$form.find('#random_sostav'));
		this.data.select_color = form.getCheckboxValue(this.$form.find('#select_color'));
		this.data.select_gamma = form.getCheckboxValue(this.$form.find('#select_gamma'));
		this.data.days_to_close = form.getNumberValue(this.$form.find('#days_to_close'));
		this.data.purchase_price = form.getNumberValue(this.$form.find('#purchase_price'));
		this.data.type = RESERVED_SKUS.includes(this.sku) ? this.sku : form.getValue(this.$form.find('#type')) || null;
		this.data.date_to_open = form.getValue(this.$form.find('#date_to_open')) || null;
		this.data.card_content = (() => {
			switch (this.data.card_type) {
				case 'text':
					return this.$form.find('[value="текст карточки"]')
						.parents('.tstore__edit-properties__header')
						.next()
						.find('textarea')
						.val();
				case 'image':
					return this.$form.find('.js-gallery-item')
						.eq(1)
						.find('a.js-img-title')
						.attr('href');
				default:
					return '';
			}
		})();

		this.collectPhotosData();
		this.collectTextsData();
		this.collectCharacteristicsData();
		this.collectVariantsData();
	}

	// Сбор данных о фотографиях
	collectPhotosData() {
		this.data.photos = [];
		for (const galleryItem of this.galleryItems.values()) {
			const url = galleryItem.url;
			const razmer = galleryItem.naPhoto_razmer_$get()?.val();
			const doptext = galleryItem.naPhoto_dopText_$get()?.val();

			const photo = { url };
			if (razmer) photo.naphoto_razmer = razmer;
			if (doptext) photo.naphoto_doptext = doptext;

			this.data.photos.push(photo);
		}
	}

	// Сбор текстовых данных (короткий текст, длинный текст, "шта?")
	collectTextsData() {
		this.data.texts = {};
		const shortText = form.getValue(this.$form.find('[name="descr"]'));
		const longText = form.getValue(this.$form.find('[name="text"]'));

		if (shortText) this.data.texts.short = shortText;
		if (longText) this.data.texts.long = longText;

		// Обработка специального поля "шта?"
		if (App.getProject().title === '2steblya') {
			const shtaCont = this.$form.find('.js-prod-characteristic:first .js-prod-charact-value');
			if (!shtaCont.length) return;
			const shtaValue = form.getValue(shtaCont);
			if (shtaValue) this.data.texts.shta = shtaValue;
		}
	}

	// Сбор данных о разделах, составе, гамме и цвете
	collectCharacteristicsData() {
		//разделы
		this.data.razdel = [];
		this.$form.find('.tstore_partselector__part-title').each((_, t) => this.data.razdel.push($(t).text()));

		//состав, гамма, цвет
		this.data.sostav = [];
		this.data.gamma = [];
		this.data.color = [];

		const map = {
			'гамма': 'gamma',
			'цвет': 'color',
			'состав': 'sostav'
		};

		this.$form.find('.tstore__edit-characteristics__item').each((_, el) => {
			const $el = $(el);
			const title = $el.find('.js-prod-charact-title').val();
			const value = $el.find('.js-prod-charact-value').val();
			const key = map[title];
			if (key && Array.isArray(this.data[key])) this.data[key].push(value);
		});
	}

	// Сбор данных о вариантах товара
	collectVariantsData() {
		this.data.variants = [];
		const $variants = this.Product.getVariants();
		if ($variants.length) {
			$variants.each((_, el) => {
				const $el = $(el);
				this.data.variants.push({
					artikul: $el.find('[data-field-name="sku"]').val(),
					price: $el.find('[data-field-name="price"]').val(),
					priceold: $el.find('[data-field-name="priceold"]').val(),
					quantity: $el.find('[data-field-name="quantity"]').val(),
					format: $el.find('.tstore__editions-controls__opt-col input').val()
				});
			});
		} else {
			this.data.variants.push({
				artikul: this.$form.find('[name="sku"]').val(),
				price: this.$form.find('[name="price"]').val(),
				priceold: this.$form.find('[name="priceold"]').val(),
				quantity: this.$form.find('[name="quantity"]').val()
			});
		}
	}
}

