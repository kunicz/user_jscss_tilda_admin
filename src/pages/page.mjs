import RootClass from '@helpers/root_class';
import App from '@src';
import wait from '@helpers/wait';
import dom from '@helpers/dom';

export default class Page extends RootClass {
	static name = 'page';

	async init() {
		await wait.sec();
		this.frontendCssInAdmin();

	}

	// применяет стили бандла и из админки на страницу
	async frontendCssInAdmin() {
		const styles = [];
		console.log(dom('[data-record-cod="T123"] .css'));
		dom('[data-record-cod="T123"] .css').forEach(el => styles.push(el.txt()));

		//скрываем товары в каталогах
		styles.push('[data-custom-class$="catalog"] .t776{text-align:center}');
		styles.push('[data-custom-class$="catalog"] .t776:before{content:"товары каталога"}');
		styles.push('.js-store{display:none !important;}');

		//применяем стили бандла
		const code = App.shop?.shop_crm_code;
		[
			`<link rel="stylesheet" type="text/css" href="https://php.2steblya.ru/jscss/tilda_frontend/${code}.min.css">`,
			`<link rel="stylesheet" type="text/css" href="https://php.2steblya.ru/jscss/tilda_frontend/${code}.min.css.map">`
		].forEach(el => dom(el).lastTo('body'));

		//применяем стили из админки
		if (styles.length) {
			dom(`<style id="styles_from_admin_tilda">${styles.join('')}</style>`).lastTo('body');
			console.log('user_jscss: стили применены');
		}
	}
}