import page from '@pages/page';
import store from '@pages/store';
import project from '@pages/project';
import projects from '@pages/projects';

export { page, store, project, projects };
export const routes = {
	page: /page/,
	store: /store/,
	project: /projects\/\?/,
	projects: /projects\/$/,
}