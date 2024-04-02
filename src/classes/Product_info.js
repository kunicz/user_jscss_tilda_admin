export function listen() {

	//запускаем, если сразу открывается товар в админке
	if (window.location.search.indexOf('productuid')) process();

	const targetNode = document;
	const config = { childList: true, subtree: true };
	const callback = function (mutationsList, observer) {
		for (const mutation of mutationsList) {
			if (mutation.type === 'childList') {
				mutation.addedNodes.forEach(node => {
					if (node.classList && node.classList.contains('tstore__editbox')) {
						process();
					}
				});
			}
		}
	};
	const observer = new MutationObserver(callback);
	observer.observe(targetNode, config);
}

function process() {
	addProductsArticlesHelper();
}

function addProductsArticlesHelper() {
	const disclaimer = $('<div class="pe-hint skuDisclaimer"></div>');
	const spans = {
		'букеты': '',
		'коробки': 'x',
		'корзины': 'b',
		'пакет': 'p',
		'кастрюли': 'q',
		'горшки': 'g',
		'ящики': 'y',
		'сердца': 'h',
		'тыквы': 't',
		'елки': 'e',
		'венок': 'w',
		'витрина': 'v'
	};
	$.each(spans, (name, letter) => {
		const span = $(`<span>${name}&nbsp;(<b>${letter}</b>)</span>`);
		span.appendTo(disclaimer);
		span.on('click', function () {
			navigator.clipboard.writeText($(this).children('b').text());
		});
	});
	setTimeout(() => {
		disclaimer.insertBefore($('#product_properties_table_box'));
	}, 500);
}