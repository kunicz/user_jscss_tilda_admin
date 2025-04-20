import App from '@src';

export default class Projects {
	static name = 'projects';

	init() {
		this.cityInTitle();
	}

	//добавляет город в заголовок
	cityInTitle() {
		$('.td-site__section-one[href^="/projects"]').each((_, e) => {
			const $this = $(e);
			const $node = $this.children('.td-site__title');
			const city = App.shops.find(shop => shop.shop_tilda_id == $this.data('project-id')).city_title;
			$node.html($node.html() + ` (${city})`);
		});
	}
}