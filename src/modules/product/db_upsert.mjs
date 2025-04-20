import RootClass from '@src/root_class';
import db from '@helpers/db';
import App from '@src';

export default class DBUpsert extends RootClass {
	constructor(product) {
		super();
		this.product = product;
		this.saveBtn = $('.tstore__editbox__updatesavebuttons button');
	}

	init() {
		this.saveBtn.on('click', async () => {
			const formData = await this.product.formData.init();
			this.upsert(formData);
		});
	}

	destroy() {
		this.saveBtn.off('click');
	}

	// сохраняет данные в БД
	async upsert(data) {
		const args = {
			set: {
				...data,
				shop_crm_id: App.shop.shop_crm_id,
			}
		}
		console.log('данные переданные в БД', args.set);
		if (!data.id) {
			console.log('заказ не сохраняем в БД');
		} else {
			const response = await db.table('products').upsert(args);
			console.log(!Number(response) ? 'изменений нет' : `заказ сохранен в БД: ${response}`);
		}
	}

}