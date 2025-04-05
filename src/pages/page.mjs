import App from '@src';
import wait from '@helpers/wait';

export default class Page {
	static moduleName = 'page';
	constructor() {
		this.shop = App.getShop();
		this.shopCode = this.shop?.shop_crm_code;
	}

	init() {
		this.frontendCssInAdmin();
	}

	// применяет стили бандла и из админки на страницу
	async frontendCssInAdmin() {
		await wait.sec();
		const styles = [];
		$('[data-record-cod="T123"] .css').each(function () {
			styles.push($(this).text());
		});

		//скрываем товары в каталогах
		styles.push('[data-custom-class$="catalog"] .t776{text-align:center}');
		styles.push('[data-custom-class$="catalog"] .t776:before{content:"товары каталога"}');
		styles.push('.js-store{display:none !important;}');

		//применяем стили бандла
		$('head').append([
			`<link rel="stylesheet" type="text/css" href="https://php.2steblya.ru/jscss/tilda_frontend/${this.shopCode}.min.css">`,
			`<link rel="stylesheet" type="text/css" href="https://php.2steblya.ru/jscss/tilda_frontend/${this.shopCode}.min.css.map">`
		].join());

		//применяем стили из админки
		if (styles.length) {
			$('body').append('<style id="styles_from_admin_tilda">' + styles.join('') + '</style>');
			console.log('user_jscss: стили применены');
		}
	}
}