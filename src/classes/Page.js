export function frontendStylesInAdmin() {
	var styles = [];
	$('.t123__code-wrapper').each(function () {
		var matches = $(this).text().match(/<style>([\s\S]*?)<\/style>/g);
		if (!matches) return;
		for (var i = 0; i < matches.length; i++) {
			var css = matches[i].replace('<style>', '').replace('</style>', '').trim();
			styles.push(css);
		}
	});

	$('head').append([
		`<link rel="stylesheet" type="text/css" href="https://php.2steblya.ru/tilda.js/${window.projectTitle}.min.css">`,
		`<link rel="stylesheet" type="text/css" href="https://php.2steblya.ru/tilda.js/${window.projectTitle}.min.css.map">`
	].join());
	if (styles.length) $('body').append('<style>' + styles.join('') + '</style>');
	$('.js-product').addClass('loaded');
}