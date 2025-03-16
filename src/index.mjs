import page from '@src/pages.mjs';
import db from '@helpers/db.mjs';
import '@css/all.css';

export let shops = [];
export let shop = {};

window.BUNDLE_VERSION = '2.1.3';

try {
	typeof jQuery !== 'undefined' ? init() : jqueryInit();
} catch (error) {
	console.error(error);
}

async function init() {
	shops = await db.getShops();
	page();
}

function jqueryInit() {
	const script = document.createElement('script');
	script.src = 'https://code.jquery.com/jquery-1.10.2.min.js';
	script.onload = initTilda();
	document.head.appendChild(script);
}
