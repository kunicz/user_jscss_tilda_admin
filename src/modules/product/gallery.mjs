import RootClass from '@src/root_class';
import GalleryItem from '@modules/product/gallery_item';
import observers from '@helpers/observers';
import { $btn } from '@src/utils';

export default class Gallery extends RootClass {
	constructor(product) {
		super();
		this.observer = observers.add('product', 'gallery');
		this.product = product;
		this.$form = product.$form;
		this.itemSelector = '.js-gallery-item';
		this.formatSelector = '.tstore__editions-controls__opt-col input';
		this.variantsDeleteSelector = '.tstore_variants__delete';
		this.items = new Map();
		product.galleryItems = this.items;
		this.$autofillBtn = $btn.clone();
		this.$removePhotosBtn = $btn.clone();
		this.$btnsContainer = $('<div id="gallery_btns"></div>').insertAfter(this.$form.find('.js-gallery-box'));
	}

	init() {
		this.initGalleryItems();
		this.listenGalleryItems();
		this.naphoto_razmer_autofill();
		this.naphoto_razmer_attachEvents();
		this.removePhotos();
	}

	destroy() {
		this.$removePhotosBtn.off('click');
		this.$autofillBtn.off('click');
		this.$form.off('change', this.formatSelector);
		this.$form.off('click', this.variantsDeleteSelector);
		this.items.forEach(item => item.destroy());
		this.items.clear();
		super.destroy();
	}

	// инициализирует объекты галереи
	initGalleryItems() {
		this.$form.find(this.itemSelector).each((index, node) => this.addGalleryItem(node, index));
	}

	// слушает добавление новых элементов галереи
	listenGalleryItems() {
		this.observer
			.setSelector(this.itemSelector)
			.onAdded((node) => this.addGalleryItem(node, this.items.size + 1))
			.onRemoved((node) => this.removeGalleryItem(node))
			.start();
	}

	// добавляет объект галереи в массив
	addGalleryItem(node, index) {
		const item = new GalleryItem(this.product, node, index);
		this.items.set(node, item);
		item.init();
	}

	// удаляет объект галереи из массива
	removeGalleryItem(node) {
		if (!this.items.has(node)) return;
		this.items.get(node).destroy();
		this.items.delete(node);
	}

	removePhotos() {
		const cb = () => {
			$(this.itemSelector).each((index, node) => {
				// пропускаем карточку
				if (shouldSkipFirstTwoItems(this.product, index) && index === 1) return;

				const item = this.items.get(node);
				item.$.find('td:last a').get(0).dispatchEvent(new MouseEvent('click', {
					bubbles: true,
					cancelable: true,
					view: window
				}));
			});
		}

		this.$removePhotosBtn.text('Удалить фотографии');
		this.$removePhotosBtn.appendTo(this.$btnsContainer).on('click', cb);
	}

	// автоматически заполняет "на фото" для галереи
	naphoto_razmer_autofill() {
		const cb = () => {
			const items = Array.from(this.items);
			items.forEach(([node, item], index) => {
				if (shouldSkipFirstTwoItems(this.product, index)) return;

				let found = false;

				this.product.$variants().each((_, variant) => {
					const $variant = $(variant);
					const variantValue = $variant.val();
					const variantSrc = $variant.parent().siblings().eq(1).children('input').val();

					if (item.url === variantSrc) {
						item.naphoto.$razmer?.val(variantValue);
						found = true;
						return false;
					}
				});

				if (!found) {
					const prevItem = index > 0 ? items[index - 1][1] : null;
					const prevValue = prevItem?.naphoto.$razmer?.val();
					item.naphoto.$razmer?.val(prevValue);
				}
			});
		}

		this.$autofillBtn.text('Заполнить "на фото" автоматически');
		this.$autofillBtn.appendTo(this.$btnsContainer).on('click', cb);
	}

	// обновляет все селекты "на фото" в галерее
	naphoto_razmer_updateSelects() {
		this.items.forEach(item => item.naphoto_razmer_updateSelect());
	}

	// слушает изменение форматов
	naphoto_razmer_attachEvents() {
		this.$form.on('change', this.formatSelector, this.naphoto_razmer_updateSelects.bind(this));
		this.$form.on('click', this.variantsDeleteSelector, this.naphoto_razmer_updateSelects.bind(this));
	}
}

// проверяет, нужно ли пропускать первые два элемента для товаров с карточкой
export function shouldSkipFirstTwoItems(product, index) {
	return product.data.db?.card_type !== 'no' && index < 2;
}