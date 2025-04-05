import { SKU_VITRINA, SKU_PODPISKA, SKU_INDIVIDUAL, SKU_DONAT, SKU_TRANSPORT, SKU_CUSTOMPRICE, SKU_DOPNIK } from '@root/config';

export default class AdditionalFields {
	constructor(ProductInfo) {
		this.ProductInfo = ProductInfo;
		this.$form = ProductInfo.$form;
		this.productDb = ProductInfo?.productDb || {};
		this.type = this.productDb?.type;
		this.purchasePrice = this.productDb?.purchase_price;
		this.cardType = this.productDb?.card_type;
		this.randomSostav = this.productDb?.random_sostav;
		this.selectColor = this.productDb?.select_color;
		this.selectGamma = this.productDb?.select_gamma;
		this.evkalipt = this.productDb?.evkalipt;
		this.fixedPrice = this.productDb?.fixed_price;
		this.paidDelivery = this.productDb?.paid_delivery;
		this.allowedToday = this.productDb?.allowed_today;
		this.daysToClose = this.productDb?.days_to_close;
		this.dateToOpen = this.productDb?.date_to_open;
		this.hidden = this.productDb?.hidden;
		this.vitrinaId = this.productDb?.vitrina_id;
	}

	init() {
		this.addFields();
	}

	addFields() {
		const textNodes = [
			this._type(),
			this._purchasePrice(),
			this._cardType(),
			this._parameters(),
			this._allowness(),
			this._hidden(),
			this._vitrinaId()
		];
		$(textNodes.join('')).insertBefore(this.$form.find('.pe-form-group').eq(-3));
	}

	_type() {
		return `
		<div class="pe-form-group">
			<label class="pe-label">Тип товара (не меняй, если не знаешь)</label>
			<div class="pe-select">
				<select class="pe-input pe-select" id="type">
					<option value="">Стандартный</option>
					<option value="${SKU_PODPISKA}" ${this.type == SKU_PODPISKA ? 'selected' : ''}>Подписка (${SKU_PODPISKA})</option>
					<option value="${SKU_VITRINA}" ${this.type == SKU_VITRINA ? 'selected' : ''}>Уникальный витринный (${SKU_VITRINA})</option>
					<option value="${SKU_DOPNIK}" ${this.type == SKU_DOPNIK ? 'selected' : ''}>Допник (${SKU_DOPNIK})</option>
					<option value="${SKU_CUSTOMPRICE}" ${this.type == SKU_CUSTOMPRICE ? 'selected' : ''}>Нитакой как все (${SKU_CUSTOMPRICE})</option>
					<option value="${SKU_INDIVIDUAL}" ${this.type == SKU_INDIVIDUAL ? 'selected' : ''}>Индпошив (${SKU_INDIVIDUAL})</option>
					<option value="${SKU_DONAT}" ${this.type == SKU_DONAT ? 'selected' : ''}>Донат (${SKU_DONAT})</option>
					<option value="${SKU_TRANSPORT}" ${this.type == SKU_TRANSPORT ? 'selected' : ''}>Транспортировочное (${SKU_TRANSPORT})</option>
				</select>
			</div>
		</div>
		<script>
		$('[id^="product$form"]  #type').on('change',function(){
			$('[id^="product$form"] .pe-form-group.purchase_price').toggle($(this).val() == '${SKU_DOPNIK}');
		});
		</script>`;
	}

	_purchasePrice() {
		return `
		<div class="pe-form-group purchase_price" style="display:${this.type == SKU_DOPNIK ? 'block' : 'none'}">
			<label class="pe-label">Закупочная стоимость</label><br>
			<div class="pe-input">
				<input type="number" id="purchase_price" value="${this.purchasePrice ? this.purchasePrice : ''}"> р. (только для типа: Допник)
			</div>
		</div>`;
	}

	_cardType() {
		return `
		<div class="pe-form-group card_type">
			<label class="pe-label">Тип карточки</label>
			<div class="pe-select">
				<select class="pe-input pe-select" id="card_type">
					<option value="text" ${this.cardType == "text" ? 'selected' : ''}>Текст</option>
					<option value="image" ${this.cardType == "image" ? 'selected' : ''}>Изображение</option>
					<option value="no" ${this.cardType == "no" ? 'selected' : ''}>Без карточки</option>
				</select>
			</div>
		</div>`;
	}

	_parameters() {
		return `
		<div class="pe-form-group parameters">
			<label class="pe-label">Параметры</label><br>
			<div class="pe-input">
				<label><input type="checkbox" id="random_sostav"${this.randomSostav ? ' checked' : ''}>Свободный состав на вкус флориста</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="select_color"${this.selectColor ? ' checked' : ''}>Можно выбрать цвет</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="select_gamma"${this.selectGamma ? ' checked' : ''}>Можно выбрать гамму</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="evkalipt"${this.evkalipt ? ' checked' : ''}>Можно добавить эвкалипт</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="fixed_price"${this.fixedPrice ? ' checked' : ''}>Фиксированная цена для всех вариаций (не выводить "от" в каталогах)</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="paid_delivery"${this.paidDelivery ? ' checked' : ''}>Доставка не включена в стоиомсть (транспортировочное)</label>
			</div>
		</div>`;
	}

	_allowness() {
		return `
		<div class="pe-form-group allowness">
			<label class="pe-label">Доступность для заказывания</label>
			<div class="pe-select">
				<select class="pe-input pe-select" id="allowed_today">
					<option value="0" ${this.allowedToday == 0 ? 'selected' : ''}>Завтра</option>
					<option value="1" ${this.allowedToday == 1 ? 'selected' : ''}>Сегодня</option>
					<option value="-1" ${this.allowedToday == -1 ? 'selected' : ''}>Никогда</option>
				</select>
			</div><br>
			<div class="pe-input">
				<label>Не доступен <input type="number" id="days_to_close" value="${this.daysToClose ? this.daysToClose : '0'}"> дней, включая сегодня</label>
			</div>
			<div class="pe-input">
				<label>Не доступен до <input type="text" id="date_to_open" value="${this.dateToOpen ? this.dateToOpen : ''}"> (YYYY-MM-DD)</label>
			</div>
		</div>`;
	}

	_hidden() {
		return `
		<div class="pe-input hidden">
			<label><input type="checkbox" id="hidden"${this.hidden ? ' checked' : ''}>Скрыт в каталогах, но доступен для заказа</label>
		</div>`;
	}

	_vitrinaId() {
		return `
		<div class="pe-form-group vitrina_id">
			<label class="pe-label">Витрина ID</label><br>
			<div class="pe-input">
				<input type="text" id="vitrina_id" value="${this.vitrinaId ? this.vitrinaId : ''}">
			</div>
		</div>`;
	}
}
