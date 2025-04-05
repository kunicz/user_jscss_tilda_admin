import GalleryItem from '@modules/store/product_info/gallery_item';
import observers from '@helpers/observers';

export default class Gallery {
	constructor(Product) {
		this.observer = observers.store.add('gallery');
		this.Product = Product;
		this.$form = Product.$form;
		this.$variants = Product.$variants;
		this.itemSelector = '.js-gallery-item';
		this.formatSelector = '.tstore__editions-controls__opt-col input';
		this.Product.galleryItems = new Map();
	}

	init() {
		this.removeJunk();
		this.initGalleryItems();
		this.listenGalleryItems();
		this.naPhoto_razmer_autofill_btn();
		this.naPhoto_razmer_attachEvents();
	}

	// удаляет старые поля (не знаю почему, но они сохраняются, даже не смотря на то, что форма динамическая)
	removeJunk() {
		this.Product.galleryItems.clear();
		this.$form.find('.naPhoto__razmer').parent().remove();
		this.$form.find('.naPhoto__doptext').remove();
	}

	// инициализирует объекты галереи
	initGalleryItems() {
		this.$form.find(this.itemSelector).each((index, node) => this.addGalleryItem(node, index));
	}

	// слушает добавление новых элементов галереи
	listenGalleryItems() {
		this.observer
			.setSelector(this.itemSelector)
			.onAdded((node) => this.addGalleryItem(node))
			.onRemoved((node) => this.removeGalleryItem(node))
			.start();
	}

	// добавляет объект галереи в массив
	addGalleryItem(node, index) {
		const item = new GalleryItem(this.Product, node, index);
		item.init();
		this.Product.galleryItems.set(node, item);
	}

	// удаляет объект галереи из массива
	removeGalleryItem(node) {
		this.Product.galleryItems.delete(node);
	}

	// добавляет кнопку для автоматического заполнения "на фото"
	naPhoto_razmer_autofill_btn() {
		$('<button type="button" class="tstore_variants__edit-options">Заполнить "на фото" автоматически</button>')
			.insertAfter(this.$form.find('.js-gallery-box'))
			.on('click', this.naPhoto_razmer_autofill.bind(this));
	}

	// автоматически заполняет "на фото" для галереи
	naPhoto_razmer_autofill() {
		const galleryEntries = Array.from(this.Product.galleryItems);
		galleryEntries.forEach(([node, item], index) => {
			if (self.shouldSkipFirstTwoItems(this.Product, index)) return;

			let found = false;

			this.$variants.each((_, variant) => {
				const $variant = $(variant);
				const hiddenInputValue = $variant.find('td').eq(1).find('input[name^="editions"]').val();
				const format = $variant.find(this.formatSelector).val();

				if (item.getPhotoSrc(item.$thumb) === hiddenInputValue) {
					item.naPhoto_razmer_$get()?.val(format);
					found = true;
					return false;
				}
			});

			if (!found) {
				const prevItem = index > 0 ? galleryEntries[index - 1][1] : null;
				const prevValue = prevItem?.naPhoto_razmer_$get()?.val();
				item.naPhoto_razmer_$get()?.val(prevValue);
			}
		});
	}

	// обновляет все селекты "на фото" в галерее
	naPhoto_razmer_updateSelects() {
		this.Product.updateFormats();
		for (const [node, item] of this.Product.galleryItems) {
			this.Product.galleryItems.get(node).naPhoto_razmer_updateSelect();
		}
	}

	// слушает изменение форматов
	naPhoto_razmer_attachEvents() {
		this.$form.on('change', this.formatSelector, this.naPhoto_razmer_updateSelects.bind(this));
		this.$form.on('click', '.tstore_variants__delete', this.naPhoto_razmer_updateSelects.bind(this));
	}

	// проверяет, нужно ли пропускать первые два элемента
	// для товаров с карточкой
	static shouldSkipFirstTwoItems(Product, index) {
		return Product.productDb?.card_type !== 'no' && index < 2;
	}
}

const self = Gallery;