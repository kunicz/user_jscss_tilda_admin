import RootClass from '@src/root_class';
import { SKU_PODPISKA } from '@root/config';
import normalize from '@helpers/normalize';

export default class ProductData extends RootClass {
	constructor(product) {
		super();
		this.data = {};
		this.product = product;
		product.data = this.data;
		this.$form = product.$form;
	}

	init() {
		this.data.id = this.id();
		this.data.title = this.title();
		this.data.artikulMain = this.artikulMain();
		this.data.artikulVariant = this.artikulVariant();
		this.data.hasVariants = this.hasVariants();
		this.data.artikul = this.artikul();
		this.data.sku = this.sku();
	}

	id() {
		return normalize.int(this.$form.attr('id'));
	}

	title() {
		return this.$form.find('[name="title"]')?.val();
	}

	artikulMain() {
		// артикул, если товар без вариантов
		return this.$form.find('[name="sku"]')?.val();
	}

	artikulVariant() {
		// артикул, если товар с вариантами
		return this.$form.find('[data-field-name="sku"]:first')?.val();
	}

	hasVariants() {
		return this.$form.find('[data-field-name="sku"]:first')?.val() !== this.data.artikulMain;
	}

	artikul() {
		let artikul = this.data.artikulMain || this.data.artikulVariant;
		if (this.data.hasVariants && this.data.sku === SKU_PODPISKA) {
			artikul = artikul.replace(/\d+x\d+$/, '');
		}
		return artikul;
	}

	sku() {
		// Очищаем артикул для получения SKU (только номер)
		return this.data.artikul.replace(/-.*/, '').replace(/v$/, '').padStart(3, '0');
	}
}
