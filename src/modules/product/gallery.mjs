import RootClass from '@helpers/root_class';
import GalleryItem from '@modules/product/gallery_item';
import selectors from '@modules/product/selectors';
import dom from '@helpers/dom';
import { btn } from '@src/utils';

export default class Gallery extends RootClass {
	constructor() {
		super();
		this.form = dom(selectors.form);
		this.observer = this.setObserver();
		this.autofillBtn = btn.clone();
		this.removePhotosBtn = btn.clone();
		this.btnsContainer = dom('<div id="gallery_btns"></div>').nextTo(this.form.node('.js-gallery-box'));
		this.items = new Map();
	}

	init() {
		this.initGalleryItems();
		this.listenGalleryItems();
		this.naphoto_razmer_autofill();
		this.removePhotos();
	}

	// инициализирует объекты галереи
	initGalleryItems() {
		this.form.nodes(selectors.photo).forEach(el => this.addGalleryItem(el));
	}

	// слушает добавление новых элементов галереи
	listenGalleryItems() {
		this.observer
			.setSelector(selectors.photo)
			.onAdded((el) => this.addGalleryItem(el))
			.start();
	}

	// добавление нового элемента галереи
	addGalleryItem(el) {
		const item = new GalleryItem(el);
		item.init();
		this.items.set(el, item);
	}

	removePhotos() {
		const cb = () => {
			dom(selectors.photo).forEach((el, i) => {
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
			dom(selectors.photo).forEach((el, i) => {
				if (shouldSkipFirstTwoItems(i)) return;

				let found = false;

				dom(selectors.variant).forEach(variant => {
					const value = variant.val();
					const src = variant.ancestor(selectors.photoCont).childs('td').at(1).child('input').val();

					if (el.data('src') === src) {
						el.node(selectors.naphoto + 'razmer').val(value);
						found = true;
						return false;
					}
				});

				if (!found) {
					const prevItem = i > 0 ? el.prev() : null;
					const prevValue = prevItem?.node(selectors.naphoto + 'razmer')?.val();
					el.node(selectors.naphoto + 'razmer').val(prevValue);
				}
			});
		}
		this.autofillBtn
			.txt('Заполнить "на фото" автоматически')
			.lastTo(this.btnsContainer)
			.listen('click', cb);
	}
}

// проверяет, нужно ли пропускать первые два элемента для товаров с карточкой
export function shouldSkipFirstTwoItems(index) {
	return dom(selectors.form).data('card_type') !== 'no' && index < 2;
}