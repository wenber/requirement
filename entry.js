
// 入口
(function($, provider, T) {

	document.domain = 'qunar.com';

	var S = ScrollShow;

	// 全局调试开关
	var debug = false;

	var list = FlightList;

	provider.init(window.location);

	debug = !!provider.param('debug');

	list.debug(debug);
	provider.debug(debug);

	var duration_sorter, price_sorter,
		time_filter, time_filter2,
		carrier_filter, pager;

	var list_container = $('#hdivResultPanel');

	var bakHtml = list_container.html();

	var filter_box = $('#filter_box');


	var isSearchEnd = false;

	// 第一批数据
	$(provider).on('dp.load', function(evt, r) {

		list.init(this, list_container);

		// 旅行时长排序
		duration_sorter = new Sorter({
			el: $('#btn_sort_dur'),
			key: 'duration'
		});

		// 价格排序
		price_sorter = new Sorter({
			el: $('#btn_sort_price'),
			key: 'price'
		});

		$(duration_sorter).on('sort', function(evt, order) {

			resetScrollShow();

			list
				.resetPage()
				.setOrder(order)
				.update();

			price_sorter.reset();

		});

		$(price_sorter).on('sort', function(evt, order) {

			resetScrollShow();

			if (list.allPrice) {
				order.key = 'allpr';
			}

			list
				.resetPage()
				.setOrder(order)
				.update();

			duration_sorter.reset();

		});


		var filter_more = $('#filter_more'),
			time_filter_el = $('#time_filter').find('.time_sel');


		var filters = r.filters;


		// 第一程出发时间过滤
		time_filter = new Filter({
			data: filters['ftime0'],
			name: "起飞时间",
			key: "ftime0",
			holder: time_filter_el,
			T: T.time_filter,
			i: 1
		});

		// 第二程出发时间过滤
		time_filter2 = new Filter({
			data: filters['ftime1'],
			name: "起飞时间",
			key: "ftime1",
			holder: time_filter_el,
			T: T.time_filter,
			i: 2
		});

		// 航空公司过滤
		carrier_filter = new Filter({
			data: filters['fcarrier'],
			name: "航空公司",
			key: "fcarrier",
			holder: filter_more,
			T: T.filter
		});

		var more_filter_btn = $('#btn_filter_more');


		more_filter_btn.click(function() {

			if (this.state) {
				filter_more.hide();
				$(this).find('i').removeClass('ico_down').addClass('ico_up');
				$(this).find('span').text('更多筛选条件');

			} else {
				filter_more.show();
				$(this).find('i').removeClass('ico_up').addClass('ico_down');
				$(this).find('span').text('收起');
			}

			this.state = !this.state;

		});

		carrier_filter.has() && more_filter_btn.show();


		if (time_filter.has() || time_filter2.has() || carrier_filter.has()) {

			filter_box.show();

	    }

		$(time_filter).on('filter', function(evt, filter) {

			resetScrollShow();

			list.filter(filter);

			debug && console.log('TIME FILTER:', filter);

		});

		$(time_filter2).on('filter', function(evt, filter) {

			resetScrollShow();

			list.filter(filter);

			debug && console.log('TIME2 FILTER:', filter);

		});

		$(carrier_filter).on('filter', function(evt, filter) {

			resetScrollShow();

			list.filter(filter);

			debug && console.log('CARRIER FILTER:', filter);

		});


		pager = new Pager({
			data: list.pageInfo,
			holder: $('#hdivPager')
		});

		$(pager).on('change_page', function(evt, obj) {

			resetScrollShow();

			list.page(obj);

			$(window).scrollTop(0);

			this.update();

			debug && console.log('PAGE:', obj)


		});


		var url = 'http://qunarzz.com/flight/prd/scripts/international/multi_list_ads-' + qzzversion +'.js';


		//load others
		$.getScript(url, function() {
			debug && console.log('AD LOADED');
		});


		debug && console.log('DataProvider:load');

	}).on('dp.update', function(evt, r) { // 后续数据

		var filters = r.filters;

		if (filters) {

			time_filter.update(filters['ftime0']);

			time_filter2.update(filters['ftime1']);

			carrier_filter.update(filters['fcarrier']);

		}

		carrier_filter.has() && $('#btn_filter_more').show();

		if (time_filter.has() || time_filter2.has() || carrier_filter.has()) {

			filter_box.show();

		}

		$('#time_filter').toggle(time_filter.has() || time_filter2.has());

		// prevent refresh
		if (!$.isEmptyObject(r.carriers) ||
			!$.isEmptyObject(r.cities) ||
			!$.isEmptyObject(r.airprots) ||
			!$.isEmptyObject(r.prices) ||
			!$.isEmptyObject(r.planes)) {

			list.update();

			pager.update();

		}

		if (!$.isEmptyObject(list.filters) && !list.size() && !isSearchEnd) {
			list_container.html(bakHtml);
		}

		debug && console.log('DataProvider:update');

	}).on('dp.load-wrappers', function(evt, data) { // 报价列表

		list.showWrappers();

	}).on('dp.search_end', function() {

		isSearchEnd = true;

		if (!$.isEmptyObject(list.filters) && !list.size()) {

			list.showNoResult();

		} else if (!list.size()) {
			location.href =
				location.href.replace('multi_trip_inter', 'requirement');
		}
	})
	.on('dp.noPriceData', function() {

		var html = ['<div id="pageBox" class="msgbox1"><h3>提示信息</h3>',
					'<div id="pageBoxText">系统数据已更新，<br />正在为您重新搜索以提供更准确报价<br /><img src="http://source.qunar.com/site/images/loading.gif" /></div>',
					'</div>'].join('');

		$jex.lightbox.show(html);

		setTimeout(function() {
			location.reload();
		}, 3000);

	})
	.on('dp.error', function(evt, r) {
		if (!list.size()) {
			//location.href = location.href.replace('multi_trip_inter', 'requirement');
		}
	});


//	$(list).on('fl.open', function(evt) {
//		$(window).scrollTop($('#list_header').offset().top);
//	});


	function resetScrollShow() {
		S.reset(function() {
			pager.holder.hide();
		});
	}


})(jQuery, DataProvider, QTMPL);