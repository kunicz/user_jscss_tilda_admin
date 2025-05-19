import RootClass from '@helpers/root_class';
import GalleryItem from '@modules/product/gallery_item';
import { formSelector, variantSelector, naphotoSelector, galleryItemSelector, galleryItemContainerSelector } from '@modules/product/selectors';
import { btn } from '@src/utils';
import dom from '@helpers/dom';

export default class Gallery extends RootClass {
	constructor() {
		super();
		this.form = dom(formSelector);
		this.observer = this.setObserver();
		this.autofillBtn = btn.clone();
		this.removePhotosBtn = btn.clone();
		this.btnsContainer = dom('<div id="gallery_btns"></div>').nextTo(this.form.node('.js-gallery-box'));
	}

	init() {
		this.initGalleryItems();
		this.listenGalleryItems();
		this.naphoto_razmer_autofill();
		this.naphoto_razmer_attachEvents();
		this.removePhotos();
	}

	// инициализирует объекты галереи
	initGalleryItems() {
		this.form.nodes(galleryItemSelector).forEach(el => this.addGalleryItem(el));
	}

	// слушает добавление новых элементов галереи
	listenGalleryItems() {
		this.observer
			.setSelector(galleryItemSelector)
			.onAdded((el) => this.addGalleryItem(el))
			.start();
	}

	// добавление нового элемента галереи
	addGalleryItem(el) {
		new GalleryItem(el).init();
	}

	removePhotos() {
		const cb = () => {
			dom(galleryItemSelector).forEach((el, i) => {
				// пропускаем карточку
				if (shouldSkipFirstTwoItems(i) && i === 1) return;
				el.node('td:last-child a').trigger('click');
			});
		}
		this.removePhotosBtn
			.txt('Удалить фотографии')
			.lastTo(this.btnsContainer)
			.listen('click', cb);
	}

	// автоматически заполняет "на фото" для галереи
	naphoto_razmer_autofill() {
		const cb = () => {
			dom(galleryItemSelector).forEach((el, i) => {
				if (shouldSkipFirstTwoItems(i)) return;

				let found = false;

				dom(variantSelector).forEach(variant => {
					const value = variant.val();
					const src = variant.ancestor(galleryItemContainerSelector).childs('td').at(2).child('input').val();

					if (el.data('src') === src) {
						el.node(naphotoSelector + 'razmer').val(value);
						found = true;
						return false;
					}
				});

				if (!found) {
					const prevItem = i > 0 ? el.prev() : null;
					console.log(prevItem);
					const prevValue = prevItem?.node(naphotoSelector + 'razmer')?.val();
					el.node(naphotoSelector + 'razmer').val(prevValue);
				}
			});
		}
		this.autofillBtn
			.txt('Заполнить "на фото" автоматически')
			.lastTo(this.btnsContainer)
			.listen('click', cb);
	}

	// обновляет все селекты "на фото" в галерее
	naphoto_razmer_updateSelects() {
		dom(galleryItemSelector).forEach(el => el.data('class').naphoto_razmer_updateSelect());
	}

	// слушает изменение форматов
	naphoto_razmer_attachEvents() {
		['click', 'change'].forEach(event => {
			this.on({
				target: this.form,
				event: event,
				handler: this.naphoto_razmer_updateSelects,
			});
		});
	}
}

// проверяет, нужно ли пропускать первые два элемента для товаров с карточкой
export function shouldSkipFirstTwoItems(index) {
	return dom(formSelector).data('card_type') !== 'no' && index < 2;
}