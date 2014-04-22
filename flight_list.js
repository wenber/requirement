/**
 * 航班列表
 *
 * @param {jQuery} $
 * @param {$jex} J
 * @param {QTMPL} T
 *
 */
var FlightList = (function($, J, T) {

	/**
	 * 存储航班的key
	 * @type {Array}
	 * @private
	 */
	var _keyList = [];

	/**
	 * 存储航班
	 * @type {object}
	 * @private
	 */
	var _list = {};

	/**
	 * 当前页的数据
	 * @type {object<string>}
	 * @private
	 */
	var _currentPageData = null;

	/**
	 * 数据供应
	 * @type {object}
	 * @private
	 */
	var _provider = null;

	/**
	 * flight list 外层元素
	 * @type {jQuery<HTMLDivElement>}
	 * @private
	 */
	var _container = null;

	/**
	 * 更多航班的容器
	 * @type {jQuery|null}
	 */
	var more_flight_holder = null;

	/**
	 * 当前展开报价的航班对象
	 * @type {Flight}
	 * @private
	 */
	var _openedFlight = null;

	/**
	 * 当前打开的点评窗口
	 * @type {StarRank}
	 * @private
	 */
	var _openedStarRank = null;

	/**
	 * 分页
	 * @type {number}
	 */
	var PAGE_SIZE = 60;

	var _map = {};

	// 10分钟 毫秒数
	var TEN_MIN = 6e5;


	// 是否展示 更多航班的提示
	var show_tips = true;


	/**
	 * 更多航班
	 * @type {MoreFlights}
	 */
	var more_flight = null;

	/**
	 * alias
	 * @type {ScrollShow|*}
	 */
	var S = ScrollShow;

	/**
	 * 用于事件委托的选择器
	 * @enum {string}
	 */
	var selector = {

		MORE_FLIGHT: 'a[data-btn-more]',
		MORE_FLIGHT_TIPS: '[data-more-tips]',
		CLOSE_TIPS: '[data-close-tips]',

		OPEN: '[data-btn-open]',
		COMMENT: '[data-btn-cmt]',
		COMMENT_CLOSE: '[data-btn-cmt_close]',
		COMMENT_HOLDER: '[data-comment-holder]',
		COMMENT_LOGIN: '[data-cmt-login]',
		COMMENT_SUBMIT: '[data-cmt-submit]',
		COMMENT_MSG: '[data-cmt-msg]',
		COMMENT_USER_NAME: '[data-cmt-user_name]',
		COMMENT_PASSWORD: '[data-cmt-password]',
		MORE_WRAPPERS: '[data-btn-more_wrappers]',
		HIDE_MORE_WRAPPERS: '[data-hide]',
		HIDE_WRAPPERS: '[data-btn-close]',
		STAR_PICKER: '[data-star-picker]',
		STAR: '[data-star]',

		BOOKING: '[data-btn-booking]',

		MODAL_CLOSE: '#more_flights [rel="modal:close"]',
		SELECT_FLIGHT: '#more_flights [data-btn-choose]',
		SORT: '#more_flights [data-sort]'

	};

	return  {

		/**
		 * 初始化
		 * @param {DataProvider} provider
		 * @param {jQuery<HTMLDivElement>} container
		 */
		init: function(provider, container) {

			_provider = provider;
			_container = container;

			var self = this;

			this.allPrice = false;

			more_flight_holder = $('#more_flights');

			var data = provider.get('prices');

			$.each(data, function(key, item) {

				var flt = new Flight({
					key: key,
					prInfo: item,
					provider: provider,
					T: T.flight,
					list: self
				});

				if (flt.valid()) {

					_keyList.push(key);

					_list[key] = flt;
				}

			});

			// 默认排序
			this.setOrder({
				order: "DEF",
				key: "default"
			});

			this.filters = {};

			this.pageInfo = {
				current: 0,
				pageSize: PAGE_SIZE,
				total: Math.ceil(_keyList.length / PAGE_SIZE)
			};

			// 展示总价
			this.bindAllPrice();

			this.bindScrollShow();

			this.render().bindEvent();

			$(this).trigger('fl.init');

			this._debug && console.log('FlightList:init');

		},

		render: function() {

			_currentPageData = this.getData();

//			// 固定展开航班在第一位
//			if (_openedFlight && this.order.order == 'DEF') {
//
//				this.moveTo(_openedFlight, 0);
//
//			}

			// 固定更多航班中的 航班位置
			$.each(_map, function(k, v) {

				var idx = $.inArray(v, _currentPageData);
				idx >= 0 && _currentPageData.splice(idx, 1);
				_currentPageData.splice(idx >= 0 && idx < k ? k - 1 : k, 0, v);

			});

			// scroll show 分页 每次展示15条
			var data = _currentPageData.slice(0, S.count);

			data.length && _container.html($.map(data, function(item) {

				return _list[item].render();

			}).join(''));

			$(this).trigger('fl.render');

			this._debug && console.log('FlightList:render');

			return this;

		},

		// 绑定事件（事件委托给 flightlist 的container)
		bindEvent: function() {

			this.bindMoreFlight()
				.bindOpen()
				.bindComment()
				.bindMoreWrappers()
				.bindHideWrappers()
				.bindStarRank()
				.bindBooking();

			$(this).on('fl.filter', function(evt, filter) {

				if (_openedFlight) {
					_openedFlight.close();
					_openedFlight = null;
				}

				_map = {};

				this.reset();

				window.CLIENT_TIME = new Date();

				this._debug && console.log(filter);

			});

			$(this).on('fl.sort', function(evt, list) {

				var o = this.order.order;

				if (_openedFlight) {
					o == 'DEF' ?
						_openedFlight.open() : _openedFlight.close();
				}

				if (o != 'DEF') _map = {};

				this._debug && console.log('FlightList:sort', this.order);

			});

		},

		/**
		 * 总价展示 事件
		 */
		bindAllPrice: function() {

			var self = this;

			var cls = 'btn_shpr',
				cls_on = 'btn_shpr_on';

			$('#btnAllPrice').click(function(evt) {

				if (self.allPrice) {
					$(this)
						.text('展示总价')
						.removeClass(cls_on)
						.addClass(cls);

					$('#btn_sort_price').find('span').text('最低报价');

				} else {
					$(this)
						.text('分开展示')
						.removeClass(cls)
						.addClass(cls_on);
					$('#btn_sort_price').find('span').text('最低总价');
				}

				self.allPrice = !self.allPrice;

				self.setOrder({
					order: self.order.order,
					key: self.allPrice ? 'allpr' : 'price'
				});

				self.update();

				this._debug && console.log('AllPrice click', self.allPrice);

				evt.preventDefault();

			});

		},
		// 滚动加载
		bindScrollShow: function() {

			var self = this;

			var page_holder = $('#hdivPager');

			S.count = 15;

			S.num = this.size();

			S.init(_container.get(0), function() {

				if (S.num < 15) return; //不足15条数据返回

				// 每次加15条
				S.count += 15;

				//更新列表
				self.update();

				S.loaded = false;

				// 如果大于PAGE_SIZE 或者 当页数据不到 S.count 则停止
				if (S.count >= PAGE_SIZE || (_currentPageData.length - S.count < 0)) {
					S.stop();
					if (S.num > PAGE_SIZE) page_holder.show(); //显示页码
				}
			});

			this._debug && console.log('ScrollShow:init');
		},

		/**
		 * 更多航班 事件
		 * @returns {FlightList}
		 */
		bindMoreFlight: function() {

			var self = this;

			var timer = null;

			var last_show = null;

			_container.on('click', selector.MORE_FLIGHT, function(evt) {

				// 判断是否过10分钟（缓存过期）
				if (!self.check()) return;

				var key = $(this).data('key'),
					flt_key = $(this).data('flight');

				var flight = self.getFlight(key),
					trip = flight.trip(flt_key);

				more_flight = flight.moreFlights;

				if (!more_flight) {

					more_flight = flight.moreFlights = new MoreFlights({
						flight: flight,
						provider: _provider,
						trip: trip,
						T: T.flight_list
					});

				} else {

					more_flight.trip = trip;

				}


				J.lightbox.show(more_flight.render());

				// 存储当前航班位置
				_map[$.inArray(key, _currentPageData)] = key;

				self._debug && console.log('MoreFlight:click', key);

				evt.preventDefault();

			})
			.on('mouseover.more-tips', selector.MORE_FLIGHT_TIPS, function() {

				var $this = $(this);

				clearTimeout(timer);

				if (last_show != $this.get(0)) {
					$(last_show).find('.more-line-p').hide();
				}

				timer = setTimeout(function() {
					last_show = $this.get(0)
					$this.find('.more-line-p').show();
				}, 100);


			}).on('mouseout.more-tips', selector.MORE_FLIGHT_TIPS, function() {

				var $this = $(this);

				clearTimeout(timer);

				timer = setTimeout(function() {
					$this.find('.more-line-p').hide();

				}, 100);

			}).on('click', selector.CLOSE_TIPS, function(evt) {

				$(this).parent().hide();

				_container.off('.more-tips');


				evt.preventDefault();

			});

			$(document.body).on('click', selector.MODAL_CLOSE, function() {
				J.lightbox.hide();
				more_flight = null;
			})

			// 更多航班 选择
			.on('click', selector.SELECT_FLIGHT, function() {

				var key = more_flight.getNewKey($(this).data('key'));

				var pos = $.inArray(more_flight.flight.key, _currentPageData);

				// 替换之前位置的航班为新航班
				_map[pos] = key;

				$('#more_flights')
					.find('.a-checked')
					.removeClass('a-checked')
					.text('选择');


				$(this).addClass('a-checked').text('已选');

				setTimeout(function() {

					J.lightbox.hide();

					more_flight = null;

					if (_openedFlight) {
						
						_openedFlight.close();

						_openedFlight = null;
					}

					self.update();

					var flt = self.getFlight(key);

					flt
						.getHolder()
						.addClass(Flight.CLICKED_CLASS);

					flt.clicked = true;


				}, 200);


				self._debug && console.log('MoreFlight:select', key);


			})

			// 更多航班排序
			.on('click', selector.SORT, function(evt) {

				var key = $(this).data('sort');

				var o = more_flight.order;

				more_flight.sort({
					key: key,
					order: o.order == 'ASC' ? 'DESC' : 'ASC'
				});

				$(J.lightbox.content).html(more_flight.render());

				console.log('MoreFlight:sort', o);

				evt.preventDefault();

			});

			return this;
		},

		// 展开报价 事件绑定
		bindOpen: function() {

			var self = this;

			_container.on('click', selector.OPEN, function(evt) {

				if (!self.check()) return;

				var key = $(this).data('key');

				var flight = self.getFlight(key);

				// 如果当前有展开的航班，先关闭
				if (_openedFlight && flight != _openedFlight) {
					_openedFlight.close();
				}

				if (flight.state) {

					flight.close();
					_openedFlight = null;

					$(self).trigger('fl.close');

				} else {

					_openedFlight = flight;

					flight.open(key);

					$(self).trigger('fl.open');

				}

				self._debug && console.log('Wrappers:open', key);

				evt.preventDefault();

			});

			return this;
		},

		// 代理商点评
		bindComment: function() {
			_container.on('click', selector.COMMENT, function(evt) {

				var wrid = $(this).data('wrapper'),
					starRank = _openedFlight.getStarRank(wrid);

				if (!starRank) {
					starRank = new StarRank({
						T: T.star_rank,
						flight: _openedFlight,
						wrapper: wrid,
						provider: _provider,
						btn: $(this)
					});
					_openedFlight.setStarRank(wrid, starRank);
				}

				if (starRank === _openedStarRank) {

					starRank.close();
					_openedStarRank = null;

				} else {

					_openedStarRank && _openedStarRank.close();

					starRank.open();

					_openedStarRank = starRank;

				}

				evt.preventDefault();

			})

			.on('click', selector.COMMENT_CLOSE, function() {

				_openedStarRank.close();

				_openedStarRank = null;


			});

			return this;
		},

		// 更多报价事件
		bindMoreWrappers: function() {

			_container.on('click', selector.MORE_WRAPPERS, function(evt) {

				var $this = $(this),
					hide_list = _openedFlight
						.getListHolder()
						.find(selector.HIDE_MORE_WRAPPERS),
					wrappers = _openedFlight.wrappers,
					state = wrappers.state;

				hide_list.toggle(!state);


				if (state) {
					$(window).scrollTop(wrappers.scrollTop);
				} else {
					wrappers.scrollTop = $(window).scrollTop();
				}

				$this.html(state ?
					'更多报价<i class="ico_arr_more"></i>' : '隐藏更多报价');

				wrappers.state = !state;

				evt.preventDefault();
			});
			return this;

		},

		// 隐藏更多报价
		bindHideWrappers: function() {
			// 隐藏报价
			_container.on('click', selector.HIDE_WRAPPERS, function(evt) {

				_openedFlight.close();
				$(window).scrollTop(_openedFlight.getHolder().offset().top);

				_openedFlight = null;

				evt.preventDefault();
			});
			return this;
		},

		// 代理商点评
		bindStarRank: function() {

			_container.on('mouseover', selector.STAR_PICKER, function() {

				var value = $(this).data('star-picker'),
					picker = $(this).parents('li');

				var key = picker.find('input').get(0).name;

				setDesc(picker, _openedStarRank.getDesc(key, value));

				setValue(this, value);

			})

			.on('mouseout', selector.STAR_PICKER, function() {

				var picker = $(this).parents('li'),
					key = picker.find('input').get(0).name;

				var value = _openedStarRank.get(key);

				setDesc(picker, _openedStarRank.getDesc(key, value));

				setValue(this, value);

			})

			.on('click', selector.STAR_PICKER, function() {

				var value = $(this).data('star-picker'),
					picker = $(this).parents('li'),
					key = picker.find('input').get(0).name;

				setDesc(picker, _openedStarRank.getDesc(key, value));

				_openedStarRank.set(key, value);

				setValue(this, value);

				picker.find('input').val(value);


			})

			.on('click', selector.COMMENT_LOGIN, function(evt) {

				var cmt_holder = $(this).parents(selector.COMMENT_HOLDER),
					tips = cmt_holder.find(selector.COMMENT_MSG);

				var res = _openedStarRank.check();

				if (res) {

					tips.html(res);

				} else {
					LoginControl.login(
						cmt_holder.find(selector.COMMENT_USER_NAME).val(),
						cmt_holder.find(selector.COMMENT_PASSWORD).val(),
						function(res, msg) {
							if (res) {

								_openedStarRank.submitComment(cmt_holder, tips);

								_openedStarRank = null;

							} else {
								tips.html('<span class="f_warn">' +
									msg +'</span>');
							}
						}
					)
				}

				evt.preventDefault();
			})

			.on('click', selector.COMMENT_SUBMIT, function() {

				var cmt_holder = $(this).parents(selector.COMMENT_HOLDER),
					tips = cmt_holder.find(selector.COMMENT_MSG);

				var res = _openedStarRank.check();

				if (res) {
					tips.html(res);
				} else {
					_openedStarRank.submitComment(cmt_holder, tips);
					_openedStarRank = null;
				}
			})

			.on('mouseover', selector.STAR, function() {
				$(this).next().find('.p_qstar_tip').show();
			}).on('mouseout', selector.STAR, function() {
				$(this).next().find('.p_qstar_tip').hide();
			});

			function setValue(el, value) {
				$(el).parent().prev().css('width', value * 2 * 10 + '%')
			}

			function setDesc($el, txt) {
				$el.find('.w_txt').text(txt);
			}

			return this;
		},

		// 预订
		bindBooking: function() {

			var self = this;

			_container.on('click', selector.BOOKING, function(evt) {

				if (!self.check()) return;

				var flt_key = $(this).data('flight'),
					wrid = $(this).data('wrapper');

				var flight = self.getFlight(flt_key),
					url = flight.wrappers.getBookingUrl(wrid);


				window.open(url);

				self._debug && console.log('Booking:', url);

				evt.preventDefault();

			});

		},

		/**
		 * 获取航班对象
		 * @param key
		 * @returns {Flight}
		 */
		getFlight: function(key) {

			return _list[key];

		},

		// 更新航班
		update: function() {

			var data = _provider.get('prices');

			var self = this;

			$.each(data, function(key, item) {

				var flt = _list[key];

				if (!flt) {
					flt = new Flight({
						key: key,
						prInfo: item,
						provider: _provider,
						T: T.flight,
						list: self
					});

					if (flt.valid()) {

						_keyList.push(key);

						_list[key] = flt;
					}
				}

			});

			// update page info
			this.pageInfo.total = Math.ceil(this.size() / PAGE_SIZE);

			S.num = this.size();

			if (S.num > PAGE_SIZE) S.start();

			this.render();

			if (more_flight) {
				$(J.lightbox.content).html(more_flight.render());
			}

		},

		showWrappers: function() {

			if (!_openedFlight.wrappers) {

				_openedFlight.wrappers = new WrapperList({
					provider: _provider,
					T: T.wrapper_list,
					flight: _openedFlight
				});

			}

			//this.update();

			_openedFlight.showWrappers();

		},

		sort: function() {

			var order = this.order;

			var k = order.key,
				o = order.order;

			// 展示总价排序
			if (k == 'allpr' && o != 'DEF') {

				_keyList = this.sortAllPrice(o);

			} else {

				_keyList.sort(function(a, b) {

					var fa = _list[a],
						fb = _list[b];

					if (o == 'DEF') {
						return fa.price() - fb.price();
					} else {

						return o == 'ASC' ?
								(fa[k]() - fb[k]()) :
								(fb[k]() - fa[k]());
					}

				});

			}

			$(this).trigger('fl.sort', _keyList);

		},

		setOrder: function(o) {

			this.order = o;

			return this;
		},

		sortAllPrice: function(o) {

			var allPriceArr = [], noTaxArr = [];

			$.each(_keyList, function(i, item) {

				if (_list[item].prInfo.tax_type) {
					allPriceArr.push(item)
				} else {
					noTaxArr.push(item);
				}

			});


			allPriceArr.sort(function(a, b) {

				var pra = _list[a].prInfo, prb = _list[b].prInfo;

				var compare = (pra.pr + pra.tax)  - (prb.pr + prb.tax);

				return o == 'ASC' || o == 'DEF' ? compare : -compare;

			});

			noTaxArr.sort(function(a, b) {

				var compare = _list[a].prInfo.pr - _list[b].prInfo.pr;

				return o == 'ASC' || o == 'DEF' ? compare : -compare;

			});


			if (allPriceArr.length && noTaxArr.length) {
				return this.pushArray(allPriceArr, noTaxArr, o);
			} else {
				return (allPriceArr.length && allPriceArr)
					|| (noTaxArr.length && noTaxArr);
			}


		},

		pushArray: function(allPriceArr, noTaxArr, o) {

			var minArr = allPriceArr.length < noTaxArr.length ? allPriceArr : noTaxArr;
			var maxArr = allPriceArr.length < noTaxArr.length ? noTaxArr : allPriceArr;

			var minLen = minArr.length , maxLen = maxArr.length;

			var min = 0 , max = 0;

			var a, b;
			var arr = [];

			var pra, prb;

			for ( ; min < minLen && max < maxLen; min++) {
				a = minArr[ min ];
				pra = _list[a].prInfo;
				for (; max < maxLen; max++) {
					b = maxArr[max];
					prb = _list[b].prInfo;
					if (o === 'ASC') {
						if (pra.pr <= prb.pr) {
							arr.push(a);
							break;
						} else {
							arr.push(b);
						}
					} else {
						if (pra.pr >= prb.pr) {
							arr.push(a);
							break;
						} else {
							arr.push(b);
						}
					}
				}
			}

			if( min < minLen ){
				arr.push.apply(arr , minArr.slice(min));
			}
			if( max < maxLen ){
				arr.push.apply(arr , maxArr.slice(max));
			}

			return arr;
		},

		filter: function(filter) {

			$.extend(this.filters, filter);

			_provider.reload(this.filters);

			$(this).trigger('fl.filter', filter);
		},

		page: function(obj) {

			$.extend(this.pageInfo, obj);

			_map = {};

			this.update();

			$(this).trigger('fl.page', obj);

			this._debug && console.log('FlightList:page', obj);

		},

		resetPage: function() {

			this.pageInfo.current = 0;

			return this;

		},

		moveTo: function(flight, position) {

			var i = $.inArray(flight.key, _currentPageData);

			_currentPageData.splice(i, 1);

			_currentPageData.splice(position, 0, flight.key);

		},

		getData: function() {

			this.sort(this.order);

			var page = this.pageInfo,
				start = page.current * page.pageSize;

			var result = _keyList ?
				_keyList.slice(start, start + page.pageSize) : [];


			return result;

		},

		size: function() {
			return _keyList.length;
		},

		/**
		 * 后台过滤 重置数据
		 */
		reset: function() {

			_list = {};
			_keyList = [];

			_openedFlight = null;

			_openedStarRank = null;

			_map = {};

			S.stop();

		},

		check: function() {
			if (new Date() - CLIENT_TIME > TEN_MIN) {
				var html = ['<div id="pageBox" class="msgbox1"><h3>提示信息</h3>',
					'<div id="pageBoxText">您的前一次搜索已经过去了10分钟，<br />正在为您重新搜索以提供更准确报价<br /><img src="http://source.qunar.com/site/images/loading.gif" /></div>',
					'</div>'].join('');

				J.lightbox.show(html);

				setTimeout(function() {
					location.reload();
				}, 3000);

				return false;

			} else {
				return true;
			}
		},

		showNoResult: function() {
			_container.html('<div class="b_detail_error"><span class="e_detail_msg">对不起，没有找到符合条件的航班，请更换筛选条件。<br /> <a style="font-size:12px;" href="javascript:window.location.reload();">清空所有筛选条件</a></span></div>')
		},

		debug: function(flag) {

			this._debug = flag;

		}

	};

})(jQuery, $jex, QTMPL);