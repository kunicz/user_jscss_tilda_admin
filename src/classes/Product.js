import copyBtn from "kunicz_copybtn";

export class Product {

	t = 'td-prod__';

	constructor(node) {
		this.node = node;
		this.title = null;
		this.article = null;
		this.tildaId = null;
	}

	process() {
		return Promise((resolve) => {

			//class
			if (this.node.is('.processed')) {
				resolve();
				return;
			}
			this.node.addClass('processed');

			// название товара
			this.title = this.node.find(`.${this.t}td-title__btn`).text().trim();
			this.node.find(`.${this.t}td-title__btn`).append(copyBtn(this.title));

			//uid товара
			this.tildaId = this.node.data('store-product-uid');
			this.uidTd();

			//sku/article
			this.defineArticle(this.node.find(`.${this.t}sku`).text());
			this.lastArticle();

			//кнопка: показать варианты товара
			const expandBtn = this.node.find(`.${this.t}variants-expand`);
			if (!expandBtn.length) {
				resolve();
				return;
			}
			$(expandBtn).trigger('click');
			const int = setInterval(() => {
				if (!this.node.next()) return;
				if (!this.node.next().is('.js-edition')) return;

				this.defineArticle(this.node.next().find(`.${this.t}sku`).text());
				this.lastArticle();

				expandBtn.click();
				clearInterval(int);
				resolve();
			}, 100);
		});
	}

	defineArticle(sku) {
		this.article = sku.replace(/\-.+/, '');
		this.node.find(`.${this.t}sku`).text(this.article);
	}

	lastArticle() {
		const article = parseInt(this.article);
		const reservedArticles = [666, 777, 888, 999, 1000, 1111];
		if (reservedArticles.includes(article)) return;
		const last = parseInt($('#lastArticle').text());
		if (last < article) $('#lastArticle').text(article);
	}

	uidTd() {
		const td = $(`<td class="${this.t}-uid">${this.tildaId}</td>`);
		td.append(copyBtn(this.tildaId));
		td.insertAfter(this.node.find(`.${this.t}td-title`));
	}

}