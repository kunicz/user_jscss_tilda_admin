import Projects from '@pages/projects';

export default class Project {
	static moduleName = 'project';

	init() {
		Projects.listen();
		this.cityInTitle();
	}

	//добавляет город в заголовок
	cityInTitle() {
		Projects.appendCityToTitle($('.td-project-midpanel__site-title'));
	}
}