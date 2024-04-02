import { Product } from './Product.js';

export function listen() {

	process();

	const targetNode = document;
	const config = { childList: true, subtree: true };
	const callback = function (mutationsList, observer) {
		for (const mutation of mutationsList) {
			if (mutation.type === 'childList') {
				mutation.addedNodes.forEach(node => {
					if (node.classList && node.classList.contains('js-product')) {
						const product = new Product($(node));
						product.process();
					}
				});
			}
		}
	};
	const observer = new MutationObserver(callback);
	observer.observe(targetNode, config);
}

function process() {
	const products = $('.js-product:not(.processed)');
	if (!products.length) return;
	products.each((i, e) => {
		setTimeout(() => {
			const product = new Product($(e));
			product.process();
		}, 500);
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
