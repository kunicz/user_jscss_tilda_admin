import RootClass from '@helpers/root_class';
import App from '@src';
import dom from '@helpers/dom';

export default class Project extends RootClass {
	static name = 'project';

	init() {
		this.cityInTitle();
	}

	//добавляет город в заголовок
	cityInTitle() {
		const el = dom('.td-project-midpanel__site-title');
		el.html(`${el.html()} (${App.shop?.city_title})`);
	}
}