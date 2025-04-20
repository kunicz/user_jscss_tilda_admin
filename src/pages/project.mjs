import App from '@src';

export default class Project {
	static name = 'project';

	init() {
		this.cityInTitle();
	}

	//добавляет город в заголовок
	cityInTitle() {
		const $node = $('.td-project-midpanel__site-title');
		$node.html($node.html() + ` (${App.shop?.city_title})`);
	}
}