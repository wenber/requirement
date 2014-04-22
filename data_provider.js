
/**
 * 数据加载及处理
 *
 */
var DataProvider = (function($) {


	/**
	 * 接口地址
	 * @enum {string}
	 */
	var api = {

		FIRST: "/twelli/multiWaySearch",
		UPDATE: "/twelli/flight/multiway_flight_groupdata_inter.jsp",
		WRAPPERS: "/twelli/flight/multiway_flight_groupinfo_inter.jsp"

	};

	/**
	 * 默认下次查询的间隔
	 * @type {number}
	 */
	var DEFAULT_INTERVAL = 2000;


	var TIME_OUT = 1e4;

	/**
	 * 地址查询参数
	 * @type {object}
	 * @private
	 */
	var _urlParams = {};


	/**
	 * 接口参数
	 * @type {object}
	 * @private
	 */
	var _param = {};

	var _timer = null;

	// 数据
	var _data = {
		prices: {}
	};

	// this 的 alias
	var self = null;

	/**
	 *
	 * @type {jQuery}
	 */
	var $this = null;


	var queryIDs = {};

	var queryID = null;

	var _st = null;


	return {

		init: function(location) {

			self = this;

			$this = $(this);

			_urlParams = this.parseUrlParam(location.search);

			_param.fromCity = _urlParams.fromCity;
			_param.toCity = _urlParams.toCity;
			_param.fromDate = _urlParams.fromDate;

			_st = new Date();

			this.load(api.FIRST, true);

			return this;

		},

		get: function(key, subkey) {

			var data = _data[key];

			return subkey ? data ? data[subkey] : null : data;

		},

		update: function(key, data) {

			if (!data || $.isEmptyObject(data)) return;

			var res = _data[key];

			if (res) {
				$.each(data, function(k, v) {
					res[k] = v;
				});
			} else {
				_data[key] = data;
			}

		},

		store: function(data) {

			self.update('flights', data.flights);
			self.update('more_flights', data.moreFlights);
			self.update('prices', data.prices);
			self.update('carriers', data.carriers);
			self.update('planes', data.planes);
			self.update('cities', data.cities);
			self.update('airports', data.airports);

			self.update('vendors', data.vendors);
			self.update('priceData', data.priceData);


		},

		load: function(url, isFirst) {

			isFirst && self._debug && console.log('=====INVOKE FIRST DATA=====');

			$.ajax({
				url: url,
				data: _param,
				cache: false,
				dataType: 'json',
				success: function(data) {

					self._debug && console.log(data);

					if (data.queryID) {

						queryID = data.queryID;

						_param.queryID = queryID;

						queryIDs[queryID] = true;
					}

					if (!data['dataCompleted'] && (new Date() - _st < TIME_OUT)) {

						self.queryNext(data.queryID, data['interval'] || DEFAULT_INTERVAL);

					} else {

						$this.trigger('dp.search_end');

					}

					self.store(data);

					if (isFirst) $this.trigger('dp.load', data);
					else $this.trigger('dp.update', data);
					

				},
				error: function(r) {
					$this.trigger('dp.error', r);
				}
			})

		},

		reload: function(param) {

			delete queryIDs[queryID];

		    this.removeParam('queryID');
			this.removeParam('flightCode');

			var self = this;

			// 空的话 清除字段
			$.each(param, function(k, filter) {
				if (filter === '') {
					self.removeParam(k);
					delete param[k];
				}
			});


			_data = { prices: {} };

			$.extend(_param, param);

			_st = new Date();

			this.load(api.FIRST);

			$this.trigger('dp.reload');

		},

		loadWrappers: function(param) {

			self._debug && console.log('=====INVOKE WRAPPERS=====');

			$.ajax({
				url: api.WRAPPERS,
				data: $.extend(_param, param),
				dataType: 'json',
				success: function(data) {

					if (data.timeoutFlag) {
						$this.trigger('dp.noPriceData');
					} else {

						self.store(data);

						$this.trigger('dp.load-wrappers', data);
					}

				}
			});

		},

		queryNext: function(qID, interval) {

			if (!queryIDs[qID]) return;

			_timer = setTimeout(function() {

				self._debug && console.log('=====INVOKE GROUP DATA=====');
				self.load(api.UPDATE);

			}, interval);

		},

		param: function(key) {
			return key ? (_urlParams[key] || "") : _urlParams;
		},

		removeParam: function(key) {

			delete _param[key];

		},

		parseUrlParam: function(search) {
			var str = search.replace('?', '');
			if (!str) { return {}; }
			str = str.split('&');
			var res = {};
			$.each(str, function(i, item) {
				var el = item.split('=');
				res[el[0]] = decodeURIComponent(el[1]) || '';
			});
			return res;
		},

		debug: function(flag) {

			this._debug = flag;

		}
	};
	
})(jQuery);