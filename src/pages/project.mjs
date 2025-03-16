import { ProjectsBase } from '@pages/projects.mjs';

class Project extends ProjectsBase {
	process() {
		this.cityInTitle();
	}

	cityInTitle() {
		const city = this.getCity(window.projectid);
		const title = $('.td-project-midpanel__site-title');
		this.appendCityToTitle(title, city);
	}
}

export default () => new Project();