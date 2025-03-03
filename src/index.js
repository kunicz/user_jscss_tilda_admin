import { projects } from './projects';
import { store } from './store';
import { page } from './page';
import { db, wait, cache } from '@helpers';

export const shops = cache();
export const shop = cache();

window.BUNDLE_VERSION = '2.0.2';

process();
async function process() {
	try {
		await wait();

		shops.set(await db.getShops());

		if (projects()) return;

		shop.set(await db.getShop({ shop_tilda_id: window.projectid }));
		if (!shop) return;

		await page();
		await store();

	} catch (error) {
		console.error(error);
	}
}