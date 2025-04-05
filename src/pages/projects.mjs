import App from '@src';

export default class Projects {
	static moduleName = 'projects';

	init() {
		self.listen();
		this.cityInTitle();
	}

	//добавляет город в заголовок
	cityInTitle() {
		$('.td-site__section-one[href^="/projects/?projectid"]').each(function () {
			const $this = $(this);
			App.project = { id: $this.data('project-id') }; // временно устанавливаем id проекта в цикле
			self.appendCityToTitle($this.children('.td-site__title'));
			App.project = null; // и обнуляем, чтобы иметь возможность получить полноценный объект позже в других модулях
		});
	}

	//слушает изменения в url
	//так как модули Products и Product делят между собой один url, то нужно следить за изменениями в search
	static listen() {
		let lastParams = window.location.search;
		const int = setInterval(() => {
			const currentParams = window.location.search;
			if (currentParams === lastParams) return;
			clearInterval(int);
			App.init();
		}, 500);
	}

	//получает город по id проекта
	static getCity() {
		return App.getShop()?.city_title;
	}

	//добавляет город в ноду
	static appendCityToTitle($node) {
		$node.html($node.html() + ' (' + self.getCity() + ')');
	}
}

const self = Projects;