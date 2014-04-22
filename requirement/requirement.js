// alert("re");
(function($, T) {

	//乘机人信息
	var passengerInfo = new PassengerInfo({
		"holder": "#module_passinfo",
		"T": T.rq_passengerInfo,
		"passengerHolder": "#passenger_list",
		"num": 0
	});

	//联系人信息
	var linkmanInfo = new LinkmanInfo({
		"holder": "#module_linkmaninfo",
		"T": T.rq_linkmanInfo
	});

	//航班信息
	var requirementSearchBox = new RequirementSearchBoxList($('form[name=fli_pass_link]')[0]);
	var submit = new Submit({
		"searchBox": requirementSearchBox,
		"passInfo": passengerInfo,
		"contactInfo": linkmanInfo
	});

	requirementSearchBox.setValue(window.location.param());

	passengerInfo.init();
	linkmanInfo.init();
	submit.init();



	(function($) {

		// 没有找到相应的航程的提示
		var wrap = $(".pub-info").first();
		var tipInfo = $jex.parseQueryParam();

		if (tipInfo.fromCity) {
			var html = [];

			var fromCity = tipInfo.fromCity.split(",");
			var toCity = tipInfo.toCity.split(",");
			var fromDate = tipInfo.fromDate.split(",");

			var len = fromCity.length;

			html.push("<div class='m-worning'>");
			html.push("<p>");

			for (var i = 0; i < len && i < 6; i++) {
				html.length === 2 && html.push("</p><p>");
				if (Boolean(fromCity[i]) && Boolean(toCity[i]) && Boolean(fromDate[i])) {
					html.push(fromCity[i], " - ", toCity[i], "（日期", fromDate[i], "）");
				}
			}

			html.push("</p>");
			html.push("<p> 此次搜索没有找到合适的结果</p>");
			html.push("<p>建议您填写下面的国际及港澳台航班需求单，去哪儿网国际机票预定代理商将帮您找到机票</p >");
			html.push("</div>");

			$(html.join("")).insertBefore(wrap);

		}

		// 提交成功后的提示事件绑定
		$(document).delegate('.ok-btn-a', 'click', function(event) {
			event.stopPropagation();
			$jex.lightbox.hide();
		});


	})(jQuery);


})(jQuery, QTMPL);