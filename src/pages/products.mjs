import RootClass from '@helpers/root_class';
import wait from '@helpers/wait';
import dom from '@helpers/dom';
import App from '@src';
import ProductsRows from '@modules/products/rows';
import { TILDA_VITRINA_RAZDEL } from '@root/config';
import '@css/store.css';

export default class Products extends RootClass {
	static name = 'products';

	constructor() {
		super();
		this.products = new ProductsRows();
	}

	async init() {
		await this.sort();
		this.products.init();
	}

	// сортировка товаров
	async sort() {
		dom('.td-store__top-controls-box select').val(this.vitrinaOrderby() || 'date-xyz').trigger('change');
		await wait.sec();
	}

	// для витрины - порядок сортировки "сперва опубликованные"
	vitrinaOrderby() {
		// Проверка, существует ли проект в storepartuids
		if (!(App.shop.title in TILDA_VITRINA_RAZDEL)) return null;

		// Получаем параметр storepartuid из URL
		const urlParams = new URLSearchParams(window.location.search);
		const storepartuid = urlParams.get('storepartuid');
		if (!storepartuid || storepartuid != TILDA_VITRINA_RAZDEL[App.shop.title]) return null;

		// Устанавливаем значение
		return 'off-abc';
	}
}