export default class RootClass {
	destroy() {
		Object.keys(this).forEach(key => {
			if (typeof this[key] !== 'function') {
				this[key] = null;
			}
		});
	}
}
