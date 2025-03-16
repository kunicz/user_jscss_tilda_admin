import * as products from '@modules/store_products.mjs';
import * as product_info from '@modules/store_product_info.mjs';
import { tilda } from '@root/config.mjs';
import wait from '@helpers/wait.mjs';
import '@css/store.css';

export default async () => {
	await reorder();
	products.watch();
	products.uidTh();
	products.lastArticle();
	product_info.watch();
}

async function reorder() {
	// Находим select
	const selectElement = document.querySelector('.td-store__top-controls-box select');
	if (!selectElement) return; // Проверяем, существует ли элемент

	// Устанавливаем значение
	selectElement.value = vitrina() || 'date-xyz';

	// Создаем и вызываем событие change
	selectElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

	await wait.sec();

	// для витрины - порядок сортировки "сперва опубликованные"
	function vitrina() {
		// Проверка, существует ли проект в storepartuids
		if (!(window.projecttitle in tilda.vitrinaRazdel)) return null;

		// Получаем параметр storepartuid из URL
		const urlParams = new URLSearchParams(window.location.search);
		const storepartuid = urlParams.get('storepartuid');
		if (!storepartuid || storepartuid != tilda.vitrinaRazdel[window.projecttitle]) return null;

		// Устанавливаем значение
		return 'off-abc';
	}
}

