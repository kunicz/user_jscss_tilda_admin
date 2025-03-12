import page from './page.js';
import store from './store.js';
import project from './project.js';
import projects from './projects.js';

export { page, store, project, projects };
export const routes = {
	page: /page/,
	store: /store/,
	project: /projects\/\?/,
	projects: /projects\/$/,
}