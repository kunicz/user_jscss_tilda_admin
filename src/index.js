import { store } from './pages/store';
import { page } from './pages/page';

setTimeout(() => {
	if (!window.projectid) return; // projectid - переменная задается тильдой

	projectCredentials();
	store();
	page();

}, 500);

function projectCredentials() {
	const projects = {
		'5683822': '2steblya',
		'3866586': 'staytrueflowers'
	}
	window.projectIds = Object.keys(projects);
	window.projectTitle = projects[window.projectid.toString()];
}