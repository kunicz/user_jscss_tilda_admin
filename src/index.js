import { store } from './pages/store';
import { page } from './pages/page';

setTimeout(async () => {
	if (!window.projectid) return; // projectid - переменная задается тильдой

	if (!await projectCredentials()) return;
	store();
	page();

}, 500);

async function projectCredentials() {
	const response = await fetch('https://php.2steblya.ru/ajax.php?script=FromDB&request=shops');
	const fromDB = await response.json();
	if (!fromDB.success) return false;
	const shops = fromDB.response;
	window.projectIds = shops.map(shop => shop.shop_tilda_id);
	window.projectTitle = shops.find(shop => shop.shop_tilda_id == window.projectid.toString())['shop_crm_code'];
	return true;
}