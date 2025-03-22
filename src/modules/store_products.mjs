import product from '@modules/store_product_in_table';
import dom from '@helpers/dom';
import wait from '@helpers/wait';

export async function watch() {
	const selector = '.js-product:not(.processed)';
	if (!await wait.element(selector)) return;

	// обрабатываем товары
	$(selector).each((_, e) => product($(e)));
	// наблюдаем за появлением новых товаров
	await wait.sec();
	dom.watcher().setSelector(selector).setCallback((node) => product($(node))).start();
}

export function uidTh() {
	const t = 'td-prod__head';
	if ($(`.${t}-table .${t}-uid`).length) return;
	$(`.${t}-table .${t}-title`).after(`<td class="${t}-uid">UID</td>`);
}

export function lastArticle() {
	const cont = $(`<div id="td-lastArticle"><div class="td-store__top-controls-box__wrapper">Последний артикул: <span id="lastArticle">0</span></div></div>`);
	cont.insertBefore($('.td-prod__listbox'));
}
