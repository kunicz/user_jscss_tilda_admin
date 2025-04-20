import RootClass from '@src/root_class';
import Gallery from '@modules/product/gallery';
import AdditionalFields from '@modules/product/additional_fields';
import DBUpsert from '@modules/product/db_upsert';
import db from '@helpers/db';
import App from '@src';

export default class DBIntegration extends RootClass {
	constructor(product) {
		super();
		this.product = product;
		this.gallery = null;
		this.dbUpsert = null;
		this.additionalFields = null;
	}

	async init() {
		// дополняем данные товара данными из БД
		this.product.data.db = await this.getProductFromDb();

		// когла данные полные, инициализируем компоненты
		this.gallery = this.initComponent(Gallery);
		this.additionalFields = this.initComponent(AdditionalFields);
		this.dbUpsert = this.initComponent(DBUpsert);
	}

	destroy() {
		this.gallery.destroy();
		this.additionalFields.destroy();
		this.dbUpsert.destroy();
		super.destroy();
	}

	// получаем данные о товаре из БД
	async getProductFromDb() {
		const productDb = await db.table('products').get({
			where: {
				id: this.product.data.id,
				shop_tilda_id: App.shop.shop_tilda_id
			},
			limit: 1
		});
		return productDb;
	}

	// инициализирует компонент
	initComponent(ComponentClass) {
		const component = new ComponentClass(this.product);
		component.init();
		return component;
	}
}
