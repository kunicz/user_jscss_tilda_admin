import { ARTIKUL_PODPISKA } from '@root/config';
import { formSelector } from '@modules/product/selectors';
import RootClass from '@helpers/root_class';
import ensure from '@helpers/ensure';
import dom from '@helpers/dom';

export default class ProductData extends RootClass {
	constructor() {
		super();
		this.data = {};
		this.form = dom(formSelector);
		this.skuMain = this.getSkuMain();
		this.skuVariant = this.getSkuVariant();
		this.sku = this.getSku();
	}

	init() {
		this.form.data('id', this.getId());
		this.form.data('title', this.getTitle());
		this.form.data('hasVariants', this.hasVariants());
		this.form.data('artikul', this.getArtikul());
		this.form.data('is_catalog_vitrina', this.isCatalogVitrina());
		this.form.data('is_vitrina', this.isVitrina());
	}

	getId() {
		return ensure.int(this.form.attr('id'));
	}

	getTitle() {
		return this.form.node('[name="title"]')?.val();
	}

	getSkuMain() { // если товар без вариантов		
		return this.form.node('[name="sku"]')?.val();
	}

	getSkuVariant() {// если товар с вариантами		
		return this.form.node('[data-field-name="sku"]:first-child')?.val();
	}

	getSku() {
		let sku = this.skuMain || this.skuVariant;
		if (this.hasVariants() && sku.startsWith(ARTIKUL_PODPISKA)) sku = sku.replace(/\d+x\d+$/, '');
		return sku;
	}

	getArtikul() {
		return this.sku.replace(/-.*/, '').replace(/v$/, '');
	}

	hasVariants() {
		return this.skuMain !== this.skuVariant;
	}

	isCatalogVitrina() {
		return this.sku.at(-1) === 'v';
	}

	isVitrina() {
		return (this.isCatalogVitrina() || this.sku.startsWith('777'));
	}
}
