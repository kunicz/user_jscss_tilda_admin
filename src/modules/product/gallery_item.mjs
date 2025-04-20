import RootClass from '@src/root_class';
import { shouldSkipFirstTwoItems } from '@modules/product/gallery';

export default class GalleryItem extends RootClass {
	constructor(product, node, index) {
		super();
		this.index = index;
		this.product = product;
		this.$form = product.$form;
		this.$ = $(node); //.js-gallery-item
		this.url = this.$.data('src');
		this.photos = product.data.db?.photos;
		this.photo = this.photos?.find(photo => photo.url === this.url);
		this.naphoto = {
			selector: 'naphoto__',
			razmer: this.photo?.naphoto_razmer,
			doptext: this.photo?.naphoto_doptext,
			$razmer: null,
			$doptext: null,
		}
	}

	init() {
		if (this.processed()) return;

		this.naphoto_razmer_add();
		this.naphoto_doptext_add();
	}

	// проверяет, был ли обработан элемент ранее
	// необходимо для корректной работы обсервера при перетаскивании фотографий
	processed() {
		return !!this.$.find(`[class^="${this.naphoto.selector}"]`).length;
	}

	// удаляет фотографий

	// добавляет поле для ввода дополнительного текста на плашке
	naphoto_doptext_add() {
		const $label = $(`<label class="pe-label">Дополнительный текст на плашке</label>`);
		const className = this.naphoto.selector + 'doptext';
		this.naphoto.$doptext = $(`<input type="text" class="pe-input ${className}" value="${this.naphoto.doptext}">`);
		this.naphoto.$doptext.appendTo(this.$.find('.js-gallery-item-showmore-div')).before($label);
	}

	// добавляет селект для выбора формата фото
	naphoto_razmer_add() {
		// пропускаем первые два фото для товаров с карточкой
		if (shouldSkipFirstTwoItems(this.product, this.index)) return;
		//пропускаем, если вариантов меньше 2
		if (this.product.$variants().length < 2) return;

		const className = this.naphoto.selector + 'razmer';
		this.naphoto.$razmer = $(`<select class="${className}"></select>`);
		this.naphoto_razmer_updateSelect();
		this.naphoto.$razmer.insertAfter(this.$.find('.tstore__editbox__gal-thumb-title')).wrap(`<td></td>`);
	}

	// обновляет селект для выбора формата фото
	naphoto_razmer_updateSelect() {
		if (!this.naphoto.$razmer) return;
		this.naphoto.$razmer.html(this.naphoto_razmer_generateOptions());
	}

	// генерирует опции для селекта
	naphoto_razmer_generateOptions() {
		const variants = this.product.$variants().toArray().map(variant => variant.value);
		return variants.map(variant => {
			const isSelected = variant === this.naphoto.razmer ? 'selected' : '';
			return `<option value="${variant}" ${isSelected}>${variant}</option>`;
		}).join('');
	}
}