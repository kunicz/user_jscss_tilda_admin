import { waitCheck, normalize } from '@helpers';
import { RESERVED_ARTICLES } from '@root/config';

export async function product($node) {

	let t = 'td-prod__';
	let title = null;
	let article = null;
	let tildaId = null;

	process();

	async function process() {
		//class
		if ($node.is('.processed')) return;
		$node.addClass('processed');

		// название товара
		title = $node.find(`.${t}td-title__btn`).text().trim();
		$node.find(`.${t}td-title__btn`);

		//uid товара
		tildaId = $node.data('store-product-uid');
		uidTd();

		//sku/article
		processArticle($node.find(`.${t}sku`).text());

		//кнопка: показать варианты товара
		const $expandBtn = $node.find(`.${t}variants-expand`);
		if (!$expandBtn.length) return;

		$expandBtn.trigger('click');
		await waitCheck(() => $node.children('.js-edition').length);
		processArticle($node.children('.js-edition').eq(0).find(`.${t}sku`).text());

		$expandBtn.trigger('click');
	}

	function processArticle(sku) {
		article = normalize.int(sku.replace(/\-.+/, ''));
		$node.find(`.${t}sku`).text(String(article).padStart(3, '0'));
		lastArticle();
	}

	function lastArticle() {
		if (RESERVED_ARTICLES.includes(article)) return;
		const cont = $('#lastArticle');
		const last = parseInt(cont.text());
		if (last < article) cont.text(article);
	}

	function uidTd() {
		$(`<td class="${t}-uid">${tildaId}</td>`).insertAfter($node.find(`.${t}td-title`));
	}

}