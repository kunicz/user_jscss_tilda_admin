import RootClass from '@helpers/root_class';
import App from '@src';
import dom from '@helpers/dom';

export default class Projects extends RootClass {
	static name = 'projects';

	init() {
		this.cityInTitle();
	}

	//добавляет город в заголовок
	cityInTitle() {
		dom('.td-site__section-one[href^="/projects"]').forEach(item => {
			const target = item.node('.td-site__title');
			const city = App.shops.find(shop => shop.shop_tilda_id == item.data('project-id'))?.city_title;
			const content = target?.html();
			if (target && city) target.html(`${content} (${city})`);
		});
	}
}