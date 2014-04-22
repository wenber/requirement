/**
 *
 * @param options
 * @constructor
 */
function Flight(options) {
	
	$.extend(this, options);

	this._cache = {};

	this.starRankList = {};

	this.origin = [];

}

/**
 * loading html
 * @type {string}
 */
Flight.LOADING = '<div class="qvt_loadding"><img style="text-align:center;" src="http://source.qunar.com/site/images/new_main/m_loading.gif" /></div>';


Flight.OPENED_CLASS = 'avt_column_on';

Flight.WRAPPER_LIST_CLASS = '.js-wrapper-list';

Flight.CLICKED_CLASS = 'avt_column_clicked';

Flight.prototype.render = function() {

	return this.T.render(this.parse());

};


/**
 * 处理航班数据
 * @return {object}
 */
Flight.prototype.parse = function() {

	var price = this.prInfo,
		key = this.key,
		keys = key.split('_'),
		_get = this.provider.get;

	var _data = {
		key: key,
		state: this.state,
		clicked: this.clicked,
		list: []
	};

	var self = this;

	$.each(keys, function(i, k) {

		var data = _get('flights', k);

		self.origin.push(data);

		var carrier = _get('carriers', data.ca);

		var more_flights = self.getMoreFlights(k),
			len = more_flights.length;

		var has_moreFlight = false;
		if ((len == 1 && more_flights[0] == k) || !more_flights || !len) {
			has_moreFlight = false;
		} else {
			has_moreFlight = true;
		}

		var trip = {
			index: i + 1,
			dep_city: _get('cities', data.dc).zh,
			arr_city: _get('cities', data.ac).zh,
			flight_num: data.co,
			carrier_code: data.ca,
			carrier: carrier.zh,
			carrier_full: carrier.full,
			plane_type: _get('planes', data.pt).abbr,
			dep_time: data.dt,
			arr_time: data.at,
			dep_airport: _get('airports', data.da).ab,
			arr_airport: _get('airports', data.aa).ab,
			dur: self.dur_txt(data.dur),
			type: '直飞',
			price: i ? null : self.parsePriceInfo(price),
			flight_key: k,
			price_key: key,
			more_flight_btn: has_moreFlight ? 'a' : 'span'

		};

		_data.list.push(trip);

		self._cache[k] = trip;

	});

	// 如果展开状态则 渲染报价列表数据
	if (this.state) {
		_data.wrappers = this.wrappers.render();
	}

	return _data;

};

Flight.prototype.parsePriceInfo = function(price) {


	var allPrice = this.list.allPrice;

	var pr = Price_html.getHTML(
		allPrice && price.tax_type ?
			price.pr + price.tax : price.pr);

	return {
		price: pr,
		price_label: allPrice && price.tax_type ? '总价' : '票价',
		tax: price.tax,
		tax_label: this.getTaxLabel(price.tax_type),
		show_tax: (price.tax_type == 1 || price.tax_type == 3) && !allPrice
	};
};

Flight.prototype.getTaxLabel = function(tax_type) {

	var allPrice = this.list.allPrice;

	var tax_type = allPrice && tax_type ?  4 : tax_type;

	var label = {
		"0": "未含税费",
		"1": "税费",
		"2": "已含税",
		"3": "参考税费",
		"4": "含税费"
	};


	return label[tax_type];

};


Flight.prototype.getMoreFlights = function(key) {

	var data = this.provider.get('more_flights', this.key);

	return data ? data[key] : [];

};


Flight.prototype.open = function(key) {

	if (this.state) return;

	this.provider.loadWrappers({
		flightCode: key
	});

	this.getHolder()
		.addClass(Flight.OPENED_CLASS)
		.find(Flight.WRAPPER_LIST_CLASS)
		.html(Flight.LOADING);

	this.state = true;

};

Flight.prototype.close = function() {

	if (!this.state) return;

	this.getHolder()
		.removeClass(Flight.OPENED_CLASS)
		.addClass(Flight.CLICKED_CLASS)
		.find(Flight.WRAPPER_LIST_CLASS)
		.empty();

	this.state = false;

	this.provider.removeParam('flightCode');

	this.clicked = true;

};


Flight.prototype.trip = function(k) {

	return this._cache[k];

};

Flight.prototype.duration = function() {

	var dur = 0;

	$.each(this.origin, function(i, item) {
		dur += (item.dur || Number.MAX_VALUE);
	});

	return dur;

};

Flight.prototype.price = function() {

	return this.prInfo.pr;

};

/**
 * 校验航班信息是否完整
 * @returns {boolean}
 */
Flight.prototype.valid = function() {

	var keys = this.key.split('_');

	var _get = this.provider.get;

	var flag = true,
		is_double = keys.length == 2;

	var log = function(str, k) {
		return;
		window.console && console.log(str, k)
	};

	is_double && $.each(keys, function(i, key) {

		var data = _get('flights', key);

		if (!data) return;

		var carrier = _get('carriers', data.ca),
			dep_city = _get('cities', data.dc),
			arr_city = _get('cities', data.ac),
			plane = _get('planes', data.pt),
			dep_airport = _get('airports', data.da),
			arr_airport = _get('airports', data.aa);

		if (!carrier) {

			flag = false;
			log('carrier not found', data.ca);
		}

		if (!dep_city) {

			flag = false;
			log('dep_city not found', data.dc);

		}

		if (!arr_city) {

			flag = false;
			log('arr_city not found', data.ac);

		}

		if (!plane) {

			flag = false;
			log('plane not found', data.pt);
		}

		if (!dep_airport) {
			flag = false;
			log('dep_airport not found', data.da);
		}

		if (!arr_airport) {
			flag = false;
			log('arr_airport not found', data.aa);
		}

	});

	return is_double && flag;

};

Flight.prototype.getStarRank = function(wrid) {

	return this.starRankList[wrid];
};

Flight.prototype.setStarRank = function(wrid, starRank) {

	this.starRankList[wrid] = starRank;

};

Flight.prototype.showWrappers = function() {

	this.getListHolder().html(this.wrappers.render());

};

Flight.prototype.getHolder = function() {

	return $(document.getElementById(this.key));

};

Flight.prototype.getListHolder = function() {
	return this.getHolder().find(Flight.WRAPPER_LIST_CLASS);
};

Flight.prototype.dur_txt = function(dur) {

	if (dur == Number.MAX_VALUE) return '';

	var hour = Math.floor(dur / 60);
	var minute = dur % 60;
	if(minute >= 24 && minute <= 36) {
		hour += 0.5;
	}else if(minute > 36) {
		hour += 1;
	}
	var dur_txt = hour ? hour + '小时' : '';
	if (dur_txt) dur_txt = '约' + dur_txt;
	return dur_txt;

};