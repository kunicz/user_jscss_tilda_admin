import { store } from './store';
import { page } from './page';

const int = setInterval(() => {
	if (!window.projectid) return; // projectid - переменная задается тильдой

	projectCredentials();

	setTimeout(() => {
		store();
		page();
	}, 500);

	clearInterval(int);
}, 100);

function projectCredentials() {
	const projects = {
		'5683822': '2steblya',
		'3866586': 'staytrueflowers'
	}
	window.projectIds = Object.keys(projects);
	window.projectTitle = projects[window.projectid.toString()];
}