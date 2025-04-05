import Gallery from '@modules/store/product_info/gallery';
import AdditionalFields from '@modules/store/product_info/additional_fields';
import DBUpsert from '@modules/store/product_info/db_upsert';
import db from '@helpers/db';
import App from '@src';

export default class DBIntegration {
	constructor() {
		this.Product = null;
		this.gallery = null;
		this.additionalFields = null;
		this.dbUpsert = null;
	}

	async init(Product) {
		this.Product = Product;
		const productDb = await this.getProductFromDb();
		this.Product.productDb = productDb;

		this.gallery = this.initComponent(Gallery);
		this.additionalFields = this.initComponent(AdditionalFields);
		this.dbUpsert = this.initComponent(DBUpsert);
	}

	// получаем данные о товаре из БД
	async getProductFromDb() {
		const productDb = await db.table('products').get({
			where: {
				id: this.Product.data.id,
				shop_tilda_id: App.getProject().id
			},
			limit: 1
		});
		return productDb;
	}

	// инициализирует компонент
	initComponent(ComponentClass) {
		const component = new ComponentClass(this.Product);
		component.init();
		return component;
	}
}
