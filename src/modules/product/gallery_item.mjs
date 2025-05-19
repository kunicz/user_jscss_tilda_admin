import RootClass from '@helpers/root_class';
import { shouldSkipFirstTwoItems } from '@modules/product/gallery';
import selectors from '@modules/product/selectors';
import dom from '@helpers/dom';

const naphoto = selectors.naphoto.slice(1);

export default class GalleryItem extends RootClass {
	constructor(el) {
		super();
		this.el = dom(el);
		this.form = dom(selectors.form);
		this.index = this.el.index();
		this.photos = this.form.data('photos');
		this.doptext = dom(`<input type="text" />`);
		this.razmer = dom('<select />');
	}

	init() {
		// проверяет, был ли обработан элемент ранее
		// для проверки достаточно убедиться в налиичии динамических полей 
		if (!!this.el.nodes(`[class^="${selectors.naphoto}"]`).length) return;

		this.naphoto_razmer_add();
		this.naphoto_doptext_add();

		this.el.data('class', this);
	}

	// добавляет поле для ввода дополнительного текста на плашке
	naphoto_doptext_add() {
		if (!this.photos) return; // пропускаем, если нет данных из бд
		this.doptext
			.addClass(`pe-input ${naphoto}doptext`)
			.lastTo(this.el.node(selectors.photo + '-showmore-div'))
			.toPrev('<label class="pe-label">Дополнительный текст на плашке</label>')
			.val(this.photos[this.index]?.[naphoto + 'doptext']);
	}

	// добавляет селект для выбора формата фото
	naphoto_razmer_add() {
		if (!this.photos) return; // если нет данных из бд		
		if (shouldSkipFirstTwoItems(this.index)) return; // если товар с карточкой
		if (this.form.nodes(selectors.variant)?.length < 2) return; // если всего одно фото

		this.razmer = dom('<select />')
			.addClass(naphoto + 'razmer')
			.nextTo(this.el.node('.tstore__editbox__gal-thumb-title'))
			.wrap('<td />');

		this.naphoto_razmer_updateSelect();
	}

	// обновляет селект для выбора формата фото
	naphoto_razmer_updateSelect() {
		this.razmer.html(this.naphoto_razmer_generateOptions());
	}

	// генерирует опции для селекта
	naphoto_razmer_generateOptions() {
		return this.form.nodes(selectors.variant)
			.map(variant => variant.val())
			.map(variant => {
				const isSelected = variant === this.photos[this.index]?.[naphoto + 'razmer'] ? 'selected' : '';
				return `<option value="${variant}" ${isSelected}>${variant}</option>`;
			}).join('');
	}
}