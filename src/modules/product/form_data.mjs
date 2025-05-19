import RootClass from '@helpers/root_class';
import App from '@src';
import { RESERVED_ARTIKULS, ARTIKUL_VITRINA } from '@root/config';
import { default as formHelper } from '@helpers/form';
import db from '@helpers/db';
import dom from '@helpers/dom';
import { formSelector, variantSelector, naphotoSelector, galleryItemSelector, galleryItemContainerSelector } from '@modules/product/selectors';

export default class FormDataBuilder extends RootClass {
	constructor() {
		super();
		this.form = dom(formSelector);
		this.data = this.collapseData();
		this.galleryItems = this.form.nodes(galleryItemSelector);
	}

	async build() {
		return await (this.data['is_catalog_vitrina'] ? this.productVitrina() : Promise.resolve(this.productNormal()));
	}

	// актуализируем данные по форме перед отправкой в бд
	collapseData() {
		const old = this.form.data();
		const cur = new FormData(this.form);
		const updated = { ...old }
		for (const [key, value] of cur.entries()) updated[key] = value;
		return updated;
	}

	//неоригинальный витринный товар
	//для таких товаров мы только обновляем vitrina_id родительского товара
	async productVitrina() {
		const parent_id = await db.table('products').get({
			fields: ['id'],
			where: {
				sku: this.data['artikul'],
				title: this.data['title'],
				shop_tilda_id: App.shop.shop_tilda_id
			},
			limit: 1
		});
		return parent_id ? { id: parent_id, vitrina_id: this.data.id } : {};
	}

	//оригинальный товар
	productNormal() {
		return {
			id: this.data['id'],
			sku: RESERVED_ARTIKULS.includes(this.data['sku']) ? this.data['sku'] : this.data['artikul'],
			vitrina_id: this.data['artikul'] == ARTIKUL_VITRINA ? this.data['id'] : this.form.node('#vitrina_id').val() || null,
			title: this.data['title'],
			allowed_today: num(this.form.node('#allowed_today')),
			card_type: val(this.form.node('#card_type')),
			hidden: check(this.form.node('#hidden')),
			evkalipt: check(this.form.node('#evkalipt')),
			fixed_price: check(this.form.node('#fixed_price')),
			paid_delivery: check(this.form.node('#paid_delivery')),
			random_sostav: check(this.form.node('#random_sostav')),
			select_color: check(this.form.node('#select_color')),
			select_gamma: check(this.form.node('#select_gamma')),
			days_to_close: num(this.form.node('#days_to_close')),
			purchase_price: num(this.form.node('#purchase_price')),
			painted: num(this.form.node('#painted')),
			type: RESERVED_ARTIKULS.includes(this.data['artikul']) ? this.data['artikul'] : val(this.form.node('#type')) || null,
			date_to_open: val(this.form.node('#date_to_open')) || null,
			card_content: this.cardContent(),
			photos: this.collectPhotosData(),
			texts: this.collectTextsData(),
			sostav: this.collectVariantsData(),
			...this.collectCharacteristicsData(),
		};
	}

	// Сбор данных о контенте карточки
	cardContent() {
		switch (this.data['card_type']) {
			case 'text':
				return this.form.node('[value="текст карточки"]')
					.ancestor('.tstore__edit-properties__header')
					.next()
					.node('textarea')
					.val();
			case 'image':
				return this.galleryItems
					.at(1)
					.data('src')
			default:
				return '';
		}
	}

	// Сбор данных о фотографиях
	collectPhotosData() {
		const data = [];
		this.galleryItems.forEach(el => {
			const photo = {};
			const naphoto = naphotoSelector.slice(1);
			const razmer = el.node(naphotoSelector + 'razmer')?.val();
			const doptext = el.node(naphotoSelector + 'doptext')?.val();

			photo.url = el.data('src');
			if (razmer) photo[naphoto + 'razmer'] = razmer;
			if (doptext) photo[naphoto + 'doptext'] = doptext;

			data.push(photo);
		});
		return data;
	}

	// Сбор текстовых данных (короткий текст, длинный текст, "шта?")
	collectTextsData() {
		const data = {};
		const shortText = this.form.node('[quill-name="descr"]').txt();
		const longText = this.form.node('[quill-name="text"]').txt();

		if (shortText) data.short = shortText;
		if (longText) data.long = longText;

		// Обработка специального поля "шта?"
		if (App.shop.title === '2steblya') {
			const shta = this.form.node('input[value="шта?"]')?.parent()?.next()?.child('input');
			if (!shtaCont.length) return;
			if (shta.val()) data.shta = shta.val();
		}
		return data;
	}

	// Сбор данных о разделах, составе, гамме и цвете
	collectCharacteristicsData() {
		const data = { razdel: [], sostav: [], gamma: [], color: [] };

		//разделы
		this.form.nodes('.tstore_partselector__part-title').forEach(el => data.razdel.push(el.txt()));

		// состав, гамма, цвет
		const map = {
			'гамма': 'gamma',
			'цвет': 'color',
			'состав': 'sostav'
		};
		this.form.nodes('.tstore__edit-characteristics__item').forEach(el => {
			const title = el.node('.js-prod-charact-title').val();
			const value = el.node('.js-prod-charact-value').val();
			const key = map[title];
			if (key) data[key].push(value);
		});

		return data;
	}

	// Сбор данных о вариантах товара
	collectVariantsData() {
		const data = [];
		const variants = this.form.nodes(variantSelector);
		if (variants.length) {
			variants.forEach(el => {
				const a = el.ancestor(galleryItemContainerSelector);
				data.push({
					artikul: a.node('[data-field-name="sku"]').val(),
					price: a.node('[data-field-name="price"]').val(),
					priceold: a.node('[data-field-name="priceold"]').val(),
					quantity: a.node('[data-field-name="quantity"]').val(),
					format: el.val()
				});
			});
		} else {
			data.push({
				artikul: this.form.node('[name="sku"]').val(),
				price: this.form.node('[name="price"]').val(),
				priceold: this.form.node('[name="priceold"]').val(),
				quantity: this.form.node('[name="quantity"]').val()
			});
		}
		return data;
	}
}

const val = (e) => formHelper.getValue(e);
const num = (e) => formHelper.getNumberValue(e);
const check = (e) => formHelper.getCheckboxValue(e);