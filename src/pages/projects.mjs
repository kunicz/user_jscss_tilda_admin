import { shops, initPage } from '@src';

export class ProjectsBase {
	constructor() {
		this.listen();
		this.process();
	}

	listen() {
		let lastParams = window.location.search;
		const int = setInterval(() => {
			const currentParams = window.location.search;
			if (currentParams === lastParams) return;
			clearInterval(int);
			initPage();
		}, 500);
	}

	getCity(projectid) {
		const projectshop = shops.find(s => s.shop_tilda_id == projectid);
		return projectshop?.city_title;
	}

	cityInTitle() { }
	appendCityToTitle(titleElement, city) {
		titleElement.html(titleElement.html() + ' (' + city + ')');
	}
}

class Projects extends ProjectsBase {
	process() {
		this.cityInTitle();
	}

	cityInTitle() {
		$('.td-site__section-one[href^="/projects/?projectid"]').each((_, e) => {
			const $this = $(e);
			const city = this.getCity($this.data('project-id'));
			const title = $this.children('.td-site__title');
			this.appendCityToTitle(title, city);
		});
	}
}

export default () => new Projects();