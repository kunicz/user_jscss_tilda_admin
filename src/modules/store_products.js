import { product } from './store_product_in_table';
import { mutationObserver, waitDomElement } from '@helpers';

export async function listen() {
	const selector = '.js-product:not(.processed)';
	if (!await waitDomElement(selector)) return;

	$(selector).each((_, e) => product($(e)));
	mutationObserver({
		addedCallback: (node) => {
			if (node.classList.contains('js-product')) {
				product($(node));
			}
		},
		config: { childList: true, subtree: true }
	});
}

export function uidTh() {
	const t = 'td-prod__head';
	$(`.${t}-table .${t}-title`).after(`<td class="${t}-uid">UID</td>`);
}

export function lastArticle() {
	const cont = $(`<div id="td-lastArticle"><div class="td-store__top-controls-box__wrapper">Последний артикул: <span id="lastArticle">0</span></div></div>`);
	cont.insertBefore($('.td-prod__listbox'));
}
