import db from '@helpers/db';
import { copy } from '@helpers/clipboard';
import wait from '@helpers/wait';
import dom from '@helpers/dom';
import normalize from '@helpers/normalize';
import form from '@helpers/form';
import { RESERVED_ARTICLES } from '@root/config';
import { shop } from '@src';

/**
 * Инициализирует наблюдение за появлением формы редактирования товара
 * Запускается при прямом открытии товара или при появлении формы в DOM
 */
export function watch() {
	if (window.location.search.indexOf('productuid')) process();
	dom.watcher().setSelector('.tstore__editbox').setCallback(process).start();
}

/**
 * Основная функция обработки формы товара
 * Инициализирует все необходимые интеграции и модификации формы
 * @returns {Promise<void>}
 */
async function process() {
	const formElement = await wait.element('[id^="productform"]');
	if (!formElement) return;

	const $form = $(formElement);
	articlesTips($form);
	longAndShortText($form);
	dbIntegration($form);
}

/**
 * меняем тильдовские заголовки:
 * Описание -> Короткий текст
 * Текст -> Длинный текст
 * 
 * @param {JQuery} $form - jQuery объект формы товара
 */
async function longAndShortText($form) {
	await wait.halfsec();
	const $formgroups = $form.children('.pe-form-group');
	$formgroups.eq(1).children('.pe-label').text('Короткий текст');
	$formgroups.eq(2).children('.pe-label').text('Длинный текст');
}

/**
 * добавляем блок с подсказками к буквенными идентификаторами для sku
 * при клике - буквенный идентификатор попадает в буфер обмена
 * 
 * @param {JQuery} $form - jQuery объект формы товара
 */
function articlesTips($form) {
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
		span.appendTo(disclaimer)
			.on('click', () => copy(span.children('b').text()));
	});
	disclaimer.insertBefore($form.find('#product_options_table_box'));
}

/**
 * создаем дополнительные чекбоксы, инпуты и селекты
 * получаем данные о товаре из БД, проставляем значения в эти поля
 * при сохранении товара создаем/обновляем данные в БД
 * 
 * @param {JQuery} $form - jQuery объект формы товара
 * @returns {Promise<void>}
 */
async function dbIntegration($form) {
	//витринные варианты каталожных товаров не обрабатываем
	const product = await db.request({
		request: 'products/get',
		flags: '&logger',
		args: {
			where: {
				id: normalize.int($form.attr('id')),
				shop_tilda_id: window.projectid
			},
			limit: 1
		}
	});
	if (product) product.card_content = normalize.cardText(product?.card_content);

	galleryIntegration($form, product);
	additionalFieldsIntegration($form, product);
	insertOrUpdateToDb($form, product);
}

/**
 * Интегрирует функционал работы с галереей товара
 * Добавляет поля для форматов и дополнительного текста к фотографиям
 * 
 * @param {JQuery} $form - jQuery объект формы товара
 * @param {Object} product - Данные о товаре из БД
 */
function galleryIntegration($form, product) {

	init();
	addAutoFillGalleryButton();
	attachUpdateformatEvents();

	/**
	 * Инициализирует обработку элементов галереи
	 * Добавляет поля к существующим элементам и настраивает наблюдение за новыми
	 */
	function init() {
		$form.find('.js-gallery-item').each((_, item) => processGalleryItem($(item)));
		dom.watcher().setSelector('.js-gallery-items').setCallback((node) => processGalleryItem($(node))).start();
	}

	/**
	 * Обрабатывает элемент галереи: добавляет поля формата и доп. текста
	 * @param {JQuery} $item - jQuery объект элемента галереи
	 */
	function processGalleryItem($item) {
		if ($item.find('.naPhoto__razmer').length) return; // Пропускаем, если поля уже добавлены

		const formats = getAvailableformats(); // Получаем доступные форматы
		const imgSrc = $item.find('.js-img-thumb').attr('src');
		const photoData = getPhotoData(product?.photos, imgSrc); // Данные о фото из продукта

		// Добавляем поля в элемент галереи
		addformatSelect($item, formats, photoData?.naphoto_razmer);
		addDopTextField($item, photoData?.naphoto_doptext);
	}

	/**
	 * Получает список доступных форматов из DOM
	 * @returns {Array<string>} Массив доступных форматов
	 */
	function getAvailableformats() {
		const formats = [];
		$form.find('.tstore__editions-controls__opt-col input').each((_, input) => formats.push($(input).val()));
		return formats;
	}

	/**
	 * Генерирует HTML-строку опций для select с форматами
	 * @param {Array<string>} formats - Массив доступных форматов
	 * @param {string} selectedformat - Выбранный формат
	 * @returns {string} HTML-строка с опциями
	 */
	function generateformatOptions(formats, selectedformat) {
		return formats.map(format => {
			const isSelected = format === selectedformat ? 'selected' : '';
			return `<option value="${format}" ${isSelected}>${format}</option>`;
		}).join('');
	}

	/**
	 * Добавляет select для выбора формата к элементу галереи
	 * @param {JQuery} $item - jQuery объект элемента галереи
	 * @param {Array<string>} formats - Массив доступных форматов
	 * @param {string} selectedformat - Выбранный формат
	 */
	function addformatSelect($item, formats, selectedformat) {
		const selectOptions = form.options(formats, selectedformat, true);
		const formatSelectHTML = `<td><select class="naPhoto__razmer">${selectOptions}</select></td>`;
		$item.find('.tstore__editbox__gal-thumb-title').after(formatSelectHTML);
	}

	/**
	 * Добавляет поле для дополнительного текста к элементу галереи
	 * @param {JQuery} $item - jQuery объект элемента галереи
	 * @param {string} dopText - Дополнительный текст
	 */
	function addDopTextField($item, dopText) {
		const dopTextHTML = `
        <label class="pe-label">Дополнительный текст на плашке</label>
        <input type="text" class="pe-input naPhoto__doptext" value="${dopText || ''}">
    	`;
		$item.find('.js-gallery-item-showmore-div').prepend(dopTextHTML);
	}

	/**
	 * Получает данные о фото из массива фотографий по URL
	 * @param {Array<Object>} photos - Массив фотографий
	 * @param {string} imgSrc - URL фотографии
	 * @returns {Object|null} Данные о фотографии или null
	 */
	function getPhotoData(photos, imgSrc) {
		if (!Array.isArray(photos) || !photos.length) return null;
		return photos.find(photo => photo.url === imgSrc);
	}

	/**
	 * Добавляет кнопку для автоматического заполнения форматов
	 */
	function addAutoFillGalleryButton() {
		$('<button type="button" class="tstore_variants__edit-options">Заполнить "на фото" автоматически</button>')
			.insertAfter($form.find('.js-gallery-box'))
			.on('click', autoFillGallery);
	}

	/**
	 * Автоматически заполняет форматы для фотографий на основе вариантов товара
	 */
	function autoFillGallery() {
		const $galleryItems = $form.find('.js-gallery-item');
		//не трогаем две первых фотки для продуктов с карточками
		const shouldSliceGalleryItems = product?.card_type !== 'no';
		const $itemsToProcess = shouldSliceGalleryItems ? $galleryItems.slice(2) : $galleryItems;

		const prodEditions = $form.find('tr.js-prod-edition');
		$itemsToProcess.each(function (index) {
			const $imgThumb = $(this).find('.js-img-thumb');
			const imgSrc = $imgThumb.attr('src');
			const $naPhotoRazmer = $(this).find('.naPhoto__razmer');
			let found = false;

			prodEditions.each(function () {
				const hiddenInputValue = $(this).find('td').eq(1).find('input[name^="editions"]').val();
				const format = $(this).find('.tstore__editions-controls__opt-col input').val();

				if (imgSrc === hiddenInputValue) {
					$naPhotoRazmer.val(format);
					found = true;
					return false;
				}
			});

			if (!found) {
				const prevValue = index === 0 ? '' : $itemsToProcess.eq(index - 1).find('.naPhoto__razmer').val();
				$naPhotoRazmer.val(prevValue);
			}
		});
	}

	/**
	 * Добавляет обработчики событий для обновления форматов
	 */
	function attachUpdateformatEvents() {
		$form.on('change', '.tstore__editions-controls__opt-col input', updateformats);
		$form.on('click', '.tstore_variants__delete', updateformats);
	}

	/**
	 * Обновляет списки форматов во всех элементах галереи
	 */
	function updateformats() {
		const formats = getAvailableformats();
		$form.find('.naPhoto__razmer').each(function () {
			const currentValue = $(this).val();
			const selectOptions = generateformatOptions(formats, currentValue);
			$(this).html(selectOptions);
		});
	}
}

/**
 * Добавляет дополнительные поля в форму товара
 * и заполняет их значениями из БД
 * 
 * @param {JQuery} $form - jQuery объект формы товара
 * @param {Object} product - Данные о товаре из БД
 */
function additionalFieldsIntegration($form, product) {
	$(`
		<div class="pe-form-group">
			<label class="pe-label">Тип товара (не меняй, если не знаешь)</label>
			<div class="pe-select">
				<select class="pe-input pe-select" id="type">
					<option value="">Стандартный</option>
					<option value="666" ${product?.type == "666" ? 'selected' : ''}>Подписка (666)</option>
					<option value="777" ${product?.type == "777" ? 'selected' : ''}>Уникальный витринный (777)</option>
					<option value="888" ${product?.type == "888" ? 'selected' : ''}>Допник (888)</option>
					<option value="999" ${product?.type == "999" ? 'selected' : ''}>Нитакой как все (999)</option>
					<option value="1000" ${product?.type == "1000" ? 'selected' : ''}>Индпошив (1000)</option>
					<option value="1111" ${product?.type == "1111" ? 'selected' : ''}>Донат (1111)</option>
					<option value="000" ${product?.type == "000" ? 'selected' : ''}>Транспортировочное (000)</option>
				</select>
			</div>
		</div>
		<script>
		$('[id^="product$form"]  #type').on('change',function(){
			$('[id^="product$form"] .pe-form-group.purchase_price').toggle($(this).val() == '888');
		});
		</script>
		<div class="pe-form-group purchase_price" style="display:${product?.type == "888" ? 'block' : 'none'}">
			<label class="pe-label">Закупочная стоимость</label><br>
			<div class="pe-input">
				<input type="number" id="purchase_price" value="${product?.purchase_price ? product?.purchase_price : ''}"> р. (только для типа: Допник)
			</div>
		</div>
		<div class="pe-form-group">
			<label class="pe-label">Тип карточки</label>
			<div class="pe-select">
				<select class="pe-input pe-select" id="card_type">
					<option value="text" ${product?.card_type == "text" ? 'selected' : ''}>Текст</option>
					<option value="image" ${product?.card_type == "image" ? 'selected' : ''}>Изображение</option>
					<option value="no" ${product?.card_type == "no" ? 'selected' : ''}>Без карточки</option>
				</select>
			</div>
		</div>
		<div class="pe-form-group">
			<label class="pe-label">Параметры</label><br>
			<div class="pe-input">
				<label><input type="checkbox" id="random_sostav"${product?.random_sostav ? ' checked' : ''}>Свободный состав на вкус флориста</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="select_color"${product?.select_color ? ' checked' : ''}>Можно выбрать цвет</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="select_gamma"${product?.select_gamma ? ' checked' : ''}>Можно выбрать гамму</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="evkalipt"${product?.evkalipt ? ' checked' : ''}>Можно добавить эвкалипт</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="fixed_price"${product?.fixed_price ? ' checked' : ''}>Фиксированная цена для всех вариаций (не выводить "от" в каталогах)</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="paid_delivery"${product?.paid_delivery ? ' checked' : ''}>Доставка не включена в стоиомсть (транспортировочное)</label>
			</div>
		</div>
		<div class="pe-form-group">
			<label class="pe-label">Доступность для заказывания</label>
			<div class="pe-select">
				<select class="pe-input pe-select" id="allowed_today">
					<option value="0" ${product?.allowed_today == 0 ? 'selected' : ''}>Завтра</option>
					<option value="1" ${product?.allowed_today == 1 ? 'selected' : ''}>Сегодня</option>
					<option value="-1" ${product?.allowed_today == -1 ? 'selected' : ''}>Никогда</option>
				</select>
			</div><br>
			<div class="pe-input">
				<label>Не доступен <input type="number" id="days_to_close" value="${product?.days_to_close ? product?.days_to_close : '0'}"> дней, включая сегодня</label>
			</div>
			<div class="pe-input">
				<label>Не доступен до <input type="text" id="date_to_open" value="${product?.date_to_open ? product?.date_to_open : ''}"> (YYYY-MM-DD)</label>
			</div>
		</div>
		<div class="pe-form-group">
			<div class="pe-input">
				<label><input type="checkbox" id="hidden"${product?.hidden ? ' checked' : ''}>Скрыт в каталогах, но доступен для заказа</label>
			</div>
		</div>
		<div class="pe-form-group">
			<label class="pe-label">Витрина ID</label><br>
			<div class="pe-input">
				<input type="text" id="vitrina_id" value="${product?.vitrina_id ? product?.vitrina_id : ''}">
			</div>
		</div>
	`).insertBefore($form.find('.pe-form-group').eq(-3));
}

/**
 * Обрабатывает сохранение товара: собирает данные из формы и отправляет в БД
 * 
 * @param {JQuery} $form - jQuery объект формы товара
 * @param {Object} product - Данные о товаре из БД
 */
function insertOrUpdateToDb($form, product) {
	$('.tstore__editbox__updatesavebuttons button').on('click', async function () {
		const data = await collectFormData();
		await saveProductData(data);
	});

	if (!product) {
		product = {};
	}

	/**
	 * Собирает все данные из формы для сохранения
	 * @returns {Promise<Object>} Объект с данными товара
	 */
	async function collectFormData() {
		const data = {};

		//id товара
		const productId = $form.attr('id').replace(/\D/g, '');

		// Находим основной инпут для артикула (он всегда есть в DOM)
		const mainArtikul = $form.find('[name="sku"]').val() || undefined;
		const variantArtikul = $form.find('[data-field-name="sku"]:first')?.val();

		// Проверяем, есть ли значение в основном инпуте. Если значение есть, значит, вариантов нет.
		const hasVariants = !mainArtikul;

		// Очищаем артикул для получения SKU (только номер)
		const sku = normalize.int((mainArtikul ?? variantArtikul).replace(/-.*/, '').replace(/v$/, ''));
		const skuPadStart = sku.toString().padStart(3, '0');

		// Обрабатывает артикул товара в зависимости от условий
		const artikul = ((artikul) => {

			// Если товар — подписка (артикул вида 666-title10x3)
			if (hasVariants && sku === 666) {
				artikul = artikul.replace(/\d+x\d+$/, '');
			}

			return artikul;

		})(mainArtikul ?? variantArtikul);


		//собираем данные для добавления/обнавления в бд
		if (artikul.endsWith('v')) {
			//неоригинальный витринный товар
			//для таких товаров мы только обновляем vitrina_id родительского товара
			product.id = await db.request({
				request: 'products/get',
				flags: '&logger',
				args: {
					fields: [
						'id'
					],
					where: {
						sku: skuPadStart,
						shop_tilda_id: window.projectid
					},
					limit: 1
				}
			});
			if (product.id) {
				data.vitrina_id = productId;
			}
		} else {
			if (!product.id) {
				// только для insert
				data.id = productId;
				data.shop_crm_id = shop.shop_crm_id;
			}
			data.sku = RESERVED_ARTICLES.includes(sku) ? artikul : skuPadStart;
			data.vitrina_id = data.sku === 777 ? data.id : form.getValue($form.find('#vitrina_id')) || null;
			data.title = form.getValue($form.find('[name="title"]'));
			data.allowed_today = form.getNumberValue($form.find('#allowed_today'));
			data.card_type = form.getValue($form.find('#card_type'));
			data.hidden = form.getCheckboxValue($form.find('#hidden'));
			data.evkalipt = form.getCheckboxValue($form.find('#evkalipt'));
			data.fixed_price = form.getCheckboxValue($form.find('#fixed_price'));
			data.paid_delivery = form.getCheckboxValue($form.find('#paid_delivery'));
			data.random_sostav = form.getCheckboxValue($form.find('#random_sostav'));
			data.select_color = form.getCheckboxValue($form.find('#select_color'));
			data.select_gamma = form.getCheckboxValue($form.find('#select_gamma'));
			data.days_to_close = form.getNumberValue($form.find('#days_to_close'));
			data.purchase_price = form.getNumberValue($form.find('#purchase_price'));
			data.type = RESERVED_ARTICLES.includes(sku) ? sku : form.getValue($form.find('#type')) || null;
			data.date_to_open = form.getValue($form.find('#date_to_open')) || null;
			data.card_content = (() => {
				switch (data.card_type) {
					case 'text':
						return $form.find('[value="текст карточки"]')
							.parents('.tstore__edit-properties__header')
							.next()
							.find('textarea')
							.val();
					case 'image':
						return $form.find('.js-gallery-item')
							.eq(1)
							.find('a.js-img-title')
							.attr('href');
					default:
						return '';
				}
			})();
			collectPhotosData();
			collectTextsData();
			collectCharacteristicsData();
			collectVariantsData();
		}

		console.log('data_to_db', data);

		return data;

		/**
		 * Сбор данных о фотографиях
		 */
		function collectPhotosData() {
			data.photos = [];
			$form.find('.js-gallery-item').each(function () {
				const url = $(this).find('a.js-img-title').attr('href');
				const razmer = $(this).find('.naPhoto__razmer').val();
				const doptext = $(this).find('.naPhoto__doptext').val();

				const photo = { url };
				if (razmer) photo.naphoto_razmer = razmer;
				if (doptext) photo.naphoto_doptext = doptext;

				data.photos.push(photo);
			});
		}

		/**
		 * Сбор текстовых данных (короткий текст, длинный текст, "шта?")
		 */
		function collectTextsData() {
			data.texts = {};
			const shortText = form.getValue($form.find('[name="descr"]'));
			const longText = form.getValue($form.find('[name="text"]'));

			if (shortText) data.texts.short = shortText;
			if (longText) data.texts.long = longText;

			// Обработка специального поля "шта?"
			if (window.projectid == 5683822) {
				const shtaCont = $form.find('.js-prod-characteristic:first .js-prod-charact-value');
				if (!shtaCont.length) return;
				const shtaValue = form.getValue(shtaCont);
				if (shtaValue) data.texts.shta = shtaValue;
			}
		}

		/**
		 * Сбор данных о разделах, составе, гамме и цвете
		 */
		function collectCharacteristicsData() {
			data.razdel = [];
			data.sostav = [];
			data.gamma = [];
			data.color = [];

			$form.find('.tstore_partselector__part-title').each((_, t) => data.razdel.push($(t).text()));

			$form.find('.tstore__edit-characteristics__item').each(function () {
				switch ($(this).find('.js-prod-charact-title').val()) {
					case 'гамма':
						data.gamma.push($(this).find('.js-prod-charact-value').val());
						break;
					case 'цвет':
						data.color.push($(this).find('.js-prod-charact-value').val());
						break;
					case 'состав':
						data.sostav.push($(this).find('.js-prod-charact-value').val());
						break;
				}
			});
		}

		/**
		 * Сбор данных о вариантах товара
		 */
		function collectVariantsData() {
			data.variants = [];
			const hasVariants = $form.find('[data-field-name]').length > 0;

			if (hasVariants) {
				$form.find('tr.js-prod-edition').each(function () {
					data.variants.push({
						artikul: $(this).find('[data-field-name="sku"]').val(),
						price: $(this).find('[data-field-name="price"]').val(),
						priceold: $(this).find('[data-field-name="priceold"]').val(),
						quantity: $(this).find('[data-field-name="quantity"]').val(),
						format: $(this).find('.tstore__editions-controls__opt-col input').val()
					});
				});
			} else {
				data.variants.push({
					artikul: $form.find('[name="sku"]').val(),
					price: $form.find('[name="price"]').val(),
					priceold: $form.find('[name="priceold"]').val(),
					quantity: $form.find('[name="quantity"]').val()
				});
			}
		}
	}

	/**
	 * Сохраняет данные товара в БД
	 * @param {Object} data - Данные товара для сохранения
	 * @returns {Promise<void>}
	 */
	async function saveProductData(data) {
		if (product.id) {
			//обновляем данные в бд
			await db.request({
				request: 'products/update',
				flags: '&logger&' + window.permission_key,
				args: {
					set: data,
					where: {
						shop_crm_id: shop.shop_crm_id,
						id: product.id
					}
				}
			});
		} else {
			//добавляем данные в бд
			const response = await db.request({
				request: 'products/insert',
				flags: '&logger&' + window.permission_key,
				args: {
					set: data
				}
			});
			if (response) product.id = $form.find('[name="productuid"]').val();
		}
	}
}