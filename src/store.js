import * as products from './modules/store_products.js';
import * as product_info from './modules/store_product_info.js';
import { wait } from '@helpers';
import './css/store.css';

export async function store() {

	if (window.location.pathname != '/store/') return false;

	console.log('user_jscss: store.tilda.ru');

	await order();
	products.listen();
	products.uidTh();
	products.lastArticle();
	product_info.listen();

	return true;
}

async function order() {
	// Находим select
	const selectElement = document.querySelector('.td-store__top-controls-box select');
	if (!selectElement) return; // Проверяем, существует ли элемент

	// Устанавливаем значение
	selectElement.value = vitrina() || 'date-xyz';

	// Создаем и вызываем событие change
	const event = new Event('change', {
		bubbles: true,
		cancelable: true
	});
	selectElement.dispatchEvent(event);

	await wait(1000);

	/**
	 * Выполняет действия с витриной, устанавливая порядок публикации
	 * 
	 * @returns {Promise<void>} Ожидает завершения выполнения через 1 секунду
	 */
	function vitrina() {
		// id раздела "витрина" для разных магазинов
		const storepartuids = {
			'2steblya': 304987403121,
			'2steblya_white': 585214725852,
			'staytrueflowers': 977039744221,
		};

		// Проверка, существует ли проект в storepartuids
		if (!(window.projecttitle in storepartuids)) return false;

		// Получаем параметр storepartuid из URL
		const urlParams = new URLSearchParams(window.location.search);
		const storepartuid = urlParams.get('storepartuid');
		if (!storepartuid || storepartuid != storepartuids[window.projecttitle]) return false;

		// Устанавливаем значение
		return 'off-abc';
	}
}

