import FormData from '@modules/store/product_info/form_data';
import db from '@helpers/db';

export default class DBUpsert {
	constructor(Product) {
		this.Product = Product;
		this.$form = Product.$form;
		this.productDb = Product?.productDb || {};
		this.formData = new FormData(this.Product);
	}

	init() {
		this.saveBtn_attachEvents();
	}

	// слушает нажатие кнопки сохранения
	saveBtn_attachEvents() {
		$('.tstore__editbox__updatesavebuttons button').on('click', async () => {
			this.upsert(this.formData.init().get());
		});
	}

	// сохраняет данные в БД
	async upsert(data) {
		const args = {
			set: {
				...data,
				shop_crm_id: this.productDb?.shop_crm_id,
				id: this.productDb?.id
			}
		}
		const response = await db.table('products').upsert(args);
		console.log(args.set);
		console.log(`product db id: ${response}`);
	}

}