import RootClass from '@helpers/root_class';
import { ARTIKUL_VITRINA, ARTIKUL_PODPISKA, ARTIKUL_INDIVIDUAL, ARTIKUL_DONAT, ARTIKUL_TRANSPORT, ARTIKUL_CUSTOMPRICE, ARTIKUL_DOPNIK } from '@root/config';
import selectors from '@modules/product/selectors';
import dom from '@helpers/dom';

export default class AdditionalFields extends RootClass {
	constructor() {
		super();
		this.form = dom(selectors.form);
		this.data = this.form.data()
	}

	init() {
		this.addFields();
		this.listenType();
	}

	// Добавление полей в форму
	addFields() {
		const textNodes = [
			this._type(),
			this._purchasePrice(),
			this._cardType(),
			this._parameters(),
			this._allowness(),
			this._vitrinaId()
		];
		dom(textNodes.join('')).prevTo(this.form.nodes('.pe-form-group').at(-3));
	}

	// Событие для показа/скрытия поля "Закупочная стоимость" в зависимости от типа товара
	listenType() {
		this.form.node('#type').listen('change', (el) => {
			this.form.node('.pe-form-group.purchase_price').toggle(el.val() == ARTIKUL_DOPNIK);
		});
	}

	_type() {
		return `
		<div class="pe-form-group">
			<label class="pe-label">Тип товара (не меняй, если не знаешь)</label>
			<div class="pe-select">
				<select class="pe-input pe-select" id="type">
					<option value="">Стандартный</option>
					<option value="${ARTIKUL_PODPISKA}" ${this.data['type'] == ARTIKUL_PODPISKA ? 'selected' : ''}>Подписка (${ARTIKUL_PODPISKA})</option>
					<option value="${ARTIKUL_VITRINA}" ${this.data['type'] == ARTIKUL_VITRINA ? 'selected' : ''}>Уникальный витринный (${ARTIKUL_VITRINA})</option>
					<option value="${ARTIKUL_DOPNIK}" ${this.data['type'] == ARTIKUL_DOPNIK ? 'selected' : ''}>Допник (${ARTIKUL_DOPNIK})</option>
					<option value="${ARTIKUL_CUSTOMPRICE}" ${this.data['type'] == ARTIKUL_CUSTOMPRICE ? 'selected' : ''}>Нитакой как все (${ARTIKUL_CUSTOMPRICE})</option>
					<option value="${ARTIKUL_INDIVIDUAL}" ${this.data['type'] == ARTIKUL_INDIVIDUAL ? 'selected' : ''}>Индпошив (${ARTIKUL_INDIVIDUAL})</option>
					<option value="${ARTIKUL_DONAT}" ${this.data['type'] == ARTIKUL_DONAT ? 'selected' : ''}>Донат (${ARTIKUL_DONAT})</option>
					<option value="${ARTIKUL_TRANSPORT}" ${this.data['type'] == ARTIKUL_TRANSPORT ? 'selected' : ''}>Транспортировочное (${ARTIKUL_TRANSPORT})</option>
				</select>
			</div>
		</div>`;
	}

	_purchasePrice() {
		return `
		<div class="pe-form-group purchase_price" style="display:${this.data['type'] == ARTIKUL_DOPNIK ? 'block' : 'none'}">
			<label class="pe-label">Закупочная стоимость</label><br>
			<div class="pe-input">
				<input type="number" id="purchase_price" value="${this.data['purchase_price'] ? this.data['purchase_price'] : ''}"> р. (только для типа: Допник)
			</div>
		</div>`;
	}

	_cardType() {
		return `
		<div class="pe-form-group card_type">
			<label class="pe-label">Тип карточки</label>
			<div class="pe-select">
				<select class="pe-input pe-select" id="card_type">
					<option value="text" ${this.data['card_type'] == "text" ? 'selected' : ''}>Текст</option>
					<option value="image" ${this.data['card_type'] == "image" ? 'selected' : ''}>Изображение</option>
					<option value="no" ${this.data['card_type'] == "no" ? 'selected' : ''}>Без карточки</option>
				</select>
			</div>
		</div>`;
	}

	_parameters() {
		return `
		<div class="pe-form-group parameters">
			<label class="pe-label">Параметры</label><br>
			<div class="pe-input">
				<label><input type="checkbox" id="random_sostav"${this.data['random_sostav'] ? ' checked' : ''}>Свободный состав на вкус флориста</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="select_color"${this.data['select_color'] ? ' checked' : ''}>Можно выбрать цвет</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="select_gamma"${this.data['select_gamma'] ? ' checked' : ''}>Можно выбрать гамму</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="evkalipt"${this.data['evkalipt'] ? ' checked' : ''}>Можно добавить эвкалипт</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="painted"${this.data['painted'] ? ' checked' : ''}>Содержит крашеные элементы</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="fixed_price"${this.data['fixed_price'] ? ' checked' : ''}>Фиксированная цена для всех вариаций (не выводить "от" в каталогах)</label>
			</div>
			<div class="pe-input">
				<label><input type="checkbox" id="paid_delivery"${this.data['paid_delivery'] ? ' checked' : ''}>Доставка не включена в стоиомсть (транспортировочное)</label>
			</div>
		</div>`;
	}

	_allowness() {
		return `
		<div class="pe-form-group allowness">
			<label class="pe-label">Доступность для заказывания</label>
			<div class="pe-select">
				<select class="pe-input pe-select" id="allowed_today">
					<option value="0" ${this.data['allowed_today'] == 0 ? 'selected' : ''}>Завтра</option>
					<option value="1" ${this.data['allowed_today'] == 1 ? 'selected' : ''}>Сегодня</option>
					<option value="-1" ${this.data['allowed_today'] == -1 ? 'selected' : ''}>Никогда</option>
				</select>
			</div>
			<div class="pe-input">
				<label>Не доступен <input type="number" id="days_to_close" value="${this.data['days_to_close'] ?? ''}"> дней, включая сегодня</label>
			</div>
			<div class="pe-input">
				<label>Не доступен до <input type="text" id="date_to_open" value="${this.data['date_to_open'] ?? ''}"> (YYYY-MM-DD)</label>
			</div>
			<div class="pe-input hidden">
				<label><input type="checkbox" id="hidden"${this.data['hidden'] ? ' checked' : ''}>Скрыт в каталогах, но доступен для заказа</label>
			</div>
		</div>`;
	}

	_vitrinaId() {
		return `
		<div class="pe-form-group vitrina_id">
			<label class="pe-label">Витрина ID</label>
			<div class="pe-input">
				<input type="text" id="vitrina_id" value="${this.data['vitrina_id'] ?? ''}">
			</div>
		</div>`;
	}
}
