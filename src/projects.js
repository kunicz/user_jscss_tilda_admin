import { shops } from './index';

export function projects() {

	if (window.location.pathname != '/projects/') return false;

	console.log('user_jscss: tilda.ru/projects');

	listen();
	process();

	return true;
}

function process() {
	cityInTitle();
}

function cityInTitle() {
	$('.td-site__section-one[href^="/projects/?projectid"]').each((_, e) => {
		const $this = $(e);
		const projectid = $this.data('project-id');
		const title = $this.children('.td-site__title');
		const projectshop = shops.find(s => s.shop_tilda_id == projectid);
		if (!projectshop) return;
		title.html(title.html() + ' (' + projectshop.city_title + ')');
	});
}

function listen() {
	let lastParams = new URLSearchParams(location.search).toString();

	setInterval(() => {
		const currentParams = new URLSearchParams(location.search).toString();
		if (currentParams !== lastParams) {
			lastParams = currentParams;
			process();
		}
	}, 500);
}
