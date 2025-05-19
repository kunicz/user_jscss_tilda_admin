import RootClass from '@helpers/root_class';
import FromDataBuilder from '@modules/product/form_data';
import db from '@helpers/db';
import dom from '@helpers/dom';
import App from '@src';

export default class DBUpsert extends RootClass {
	constructor() {
		super();
		this.FormData = new FromDataBuilder();
	}

	init() {
		dom('.tstore__editbox__updatesavebuttons button').forEach(el => {
			el.listen('click', this.upsert.bind(this));
		});
	}

	// сохраняет данные в БД
	async upsert() {
		const data = await this.FormData.build();
		if (!data.id) throw new Error('отсутсвует id');
		const args = {
			set: {
				...data,
				shop_crm_id: App.shop.shop_crm_id,
			}
		}
		console.log('данные переданные в БД:', args.set);
		const response = await db.table('products').upsert(args);
		console.log(!Number(response) ? 'изменений нет' : `заказ сохранен в БД: ${response}`);
	}
}