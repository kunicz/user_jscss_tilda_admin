import App from '@src';
import Products from '@modules/store/products';
import ProductInfo from '@modules/store/product_info';
import { TILDA_VITRINA_RAZDEL } from '@root/config';
import wait from '@helpers/wait';
import '@css/store.css';

export default class Store {
	static moduleName = 'store';

	constructor() {
		this.products = new Products();
		this.product_info = new ProductInfo();
	}

	async init() {
		await this.sort();
		this.products.init();
		this.product_info.init();
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
		if (!(App.project.title in TILDA_VITRINA_RAZDEL)) return null;

		// Получаем параметр storepartuid из URL
		const urlParams = new URLSearchParams(window.location.search);
		const storepartuid = urlParams.get('storepartuid');
		if (!storepartuid || storepartuid != TILDA_VITRINA_RAZDEL[App.project.title]) return null;

		// Устанавливаем значение
		return 'off-abc';
	}
}



