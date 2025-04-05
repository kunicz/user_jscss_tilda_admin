import is from '@helpers/is';
import Gallery from '@modules/store/product_info/gallery';

export default class GalleryItem {
	constructor(Product, node, index) {
		this.Product = Product;
		this.$form = Product.$form;
		this.$item = $(node);
		this.index = index;
		this.photos = Product.productDb?.photos;
		this.photoData = this.getPhotoData();
		this.$thumb = this.$item.find('.js-img-thumb');
		this.url = this.$item.find('a.js-img-title').attr('href');
		this.naPhoto_selector = 'naPhoto__';
		this.$naPhoto_razmer = null;
		this.$naPhoto_dopText = null;
	}

	init() {
		if (this.alreadyProcessed()) return;

		this.naPhoto_razmer_add();
		this.naPhoto_dopText_add();
	}

	alreadyProcessed() {
		return this.naPhoto_razmer_$get().length || this.naPhoto_dopText_$get().length;
	}

	// получаем данные о фото из товара
	getPhotoData() {
		if (!is.array(this.photos) || !this.photos.length) return null;
		return this.photos.find(photo => photo.url === this.getPhotoSrc(this.$thumb));
	}

	// получаем src фото
	getPhotoSrc($node) {
		return $node?.attr('src');
	}

	// добавляет поле для ввода дополнительного текста на плашке
	naPhoto_dopText_add() {
		const $label = $(`<label class="pe-label">Дополнительный текст на плашке</label>`);
		const className = this.naPhoto_selector + 'doptext';
		const value = this.photoData?.naphoto_doptext || '';
		this.$naPhoto_dopText = $(`<input type="text" class="pe-input ${className}" value="${value}">`);
		this.$naPhoto_dopText.appendTo(this.$item.find('.js-gallery-item-showmore-div')).before($label);
	}

	// получаем поле для ввода дополнительного текста на плашке
	naPhoto_dopText_$get() {
		return this.$naPhoto_dopText || $();
	}

	// добавляет селект для выбора формата фото
	naPhoto_razmer_add() {
		if (Gallery.shouldSkipFirstTwoItems(this.Product, this.index)) return;

		const className = this.naPhoto_selector + 'razmer';
		this.$naPhoto_razmer = $(`<select class="${className}"></select>`);
		this.naPhoto_razmer_updateSelect();
		this.$naPhoto_razmer.insertAfter(this.$item.find('.tstore__editbox__gal-thumb-title')).wrap(`<td></td>`);
	}

	// получаем селект для выбора формата фото
	naPhoto_razmer_$get() {
		return this.$naPhoto_razmer || $();
	}

	// обновляет селект для выбора формата фото
	naPhoto_razmer_updateSelect() {
		this.naPhoto_razmer_$get().html(this.naPhoto_razmer_generateOptions());
	}

	// генерирует опции для селекта
	naPhoto_razmer_generateOptions() {
		return this.Product.formats.map(format => {
			const isSelected = format === this.naPhoto_razmer_$get()?.val() ? 'selected' : '';
			return `<option value="${format}" ${isSelected}>${format}</option>`;
		}).join('');
	}
}