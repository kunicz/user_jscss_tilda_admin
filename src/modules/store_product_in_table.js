import { ctrlc } from '@helpers/clipboard.js';
import wait from '@helpers/wait.js';
import normalize from '@helpers/normalize.js';
import { RESERVED_ARTICLES } from '@root/config.js';

export default async ($node) => {
	let t = 'td-prod__';
	let title = null;
	let article = null;
	let tildaId = null;

	(async () => {
		//class
		if ($node.is('.processed')) return;
		$node.addClass('processed');

		// название товара
		title = $node.find(`.${t}td-title__btn`).text().trim();

		//uid товара
		tildaId = $node.data('store-product-uid');
		uidTd();

		//sku/article
		processArticle($node.find(`.${t}sku`).text());

		//кнопка: показать варианты товара
		const $expandBtn = $node.find(`.${t}variants-expand`);
		if (!$expandBtn.length) return;

		$expandBtn.trigger('click');

		const checkResult = await wait.check(() => $node.children('.js-edition').length);
		if (!checkResult) throw new Error('Не удалось дождаться появления вариантов товара');
		processArticle($node.children('.js-edition').eq(0).find(`.${t}sku`).text());

		$expandBtn.trigger('click');
	})();

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
		$(`<a>${tildaId}</a>`)
			.on("click", function (e) {
				e.preventDefault();
				ctrlc(tildaId);
			})
			.wrap(`<td class="${t}uid"></td>`)
			.parent()
			.insertAfter($node.find(`.${t}td-title`));
	}
}