import RootClass from '@helpers/root_class';
import { formSelector } from '@modules/product/selectors';
import Gallery from '@modules/product/gallery';
import AdditionalFields from '@modules/product/additional_fields';
import DBUpsert from '@modules/product/db_upsert';
import db from '@helpers/db';
import is from '@helpers/is';
import dom from '@helpers/dom';
import App from '@src';

export default class DBIntegration extends RootClass {
	constructor() {
		super();
		this.form = dom(formSelector);
		this.Gallery = new Gallery();
		this.DBUpsert = new DBUpsert();
		this.AdditionalFields = new AdditionalFields();
	}

	async init() {
		// дополняем данные товара данными из БД
		const dbData = await this.getProductFromDb();
		this.parseDbData(dbData);
		// когла данные полные, инициализируем компоненты
		this.Gallery.init();
		this.AdditionalFields.init();
		this.DBUpsert.init();
	}

	// получаем данные о товаре из БД
	async getProductFromDb() {
		const productDb = await db.table('products').get({
			where: {
				id: this.form.data('id'),
				shop_tilda_id: App.shop.shop_tilda_id
			},
			limit: 1
		});
		// временный костыль из-за перепутанности artikul и sku
		// надо будет поменять в БД название колонки
		productDb.artikul = productDb.sku; delete (productDb.sku);
		return productDb;
	}

	// добавляем данные о товаре и бд в ноду
	parseDbData(data) {
		Object.entries(data)
			.sort(([a], [b]) => a.localeCompare(b))
			.forEach(([key, value]) => {
				if (this.form.data(key)) return;
				this.form.data(key, is.null(value) ? '' : value);
			});
	}
}
