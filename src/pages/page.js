import { shop } from '../index.js';
import wait from '@helpers/wait.js';

export default async () => {
	frontendCssInAdmin();
}

/**
 * собирает все стили из всех html(t123) блоков
 * добавляет свои кастомные стили и стили сайта
 * применяет их на страницах "редактирвоания страниц"
 */
async function frontendCssInAdmin() {
	await wait.sec();

	const styles = [];
	$('[data-record-cod="T123"] .css').each(function () {
		styles.push($(this).text());
	});

	//скрываем товары в каталогах
	styles.push('[data-custom-class$="catalog"] .t776{text-align:center}');
	styles.push('[data-custom-class$="catalog"] .t776:before{content:"товары каталога"}');
	styles.push('.js-store{display:none !important;}');

	//применяем стили
	$('head').append([
		`<link rel="stylesheet" type="text/css" href="https://php.2steblya.ru/jscss/tilda_frontend/${shop.shop_crm_code}.min.css">`,
		`<link rel="stylesheet" type="text/css" href="https://php.2steblya.ru/jscss/tilda_frontend/${shop.shop_crm_code}.min.css.map">`
	].join());
	if (styles.length) {
		$('body').append('<style id="styles_from_admin_tilda">' + styles.join('') + '</style>');
		console.log('user_jscss: стили применены');
	}
}