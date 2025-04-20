import App from '@src';
import RootClass from '@src/root_class';
import ProductsRows from '@modules/products/rows';
import { TILDA_VITRINA_RAZDEL } from '@root/config';
import wait from '@helpers/wait';
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

	destroy() {
		this.products.destroy();
		super.destroy();
	}

	// сортировка товаров
	async sort() {
		const selectElement = document.querySelector('.td-store__top-controls-box select'); // Находим select
		if (!selectElement) return; // Проверяем, существует ли элемент

		selectElement.value = this.vitrinaOrderby() || 'date-xyz'; // Устанавливаем значение		
		selectElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); // Создаем и вызываем событие change
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