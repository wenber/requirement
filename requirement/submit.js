function Submit(opts) {
	$.extend(this, opts);
}

Submit.prototype.init = function(data) {

	var self = this;

	var form = $('form').eq(1);

	var passInfo = this.passInfo;
	var flight = this.searchBox;

	form.jvalidForm({
		oncheck: function() {

		},
		onchecked: function(T, elems) {
			//航班信息校验
			if (!flight.checkSubmitError()) {
				return false;
			}
			if (!T) {
				$.ui.alert($m('ERR'));
				self.trackErr(elems);
				return false;
			}
			//校验生日和证件过期时间

			var chkBthd = passInfo.checkBirthday(),
				chkExpiry = passInfo.checkExpiryDate();

			var res = [];
			chkBthd && res.push.apply(res, chkBthd);
			chkExpiry && res.push.apply(res, chkExpiry);

			if (res.length) {
				$.ui.alert(res.join('<br />'));
				return false;
			}

			//校验儿童数量,儿童至多3个
			if (!passInfo.checkChildNum()) {
				$.ui.alert("儿童至多3个");
				return false;
			}

			self.submitForm();

			return false;
		}
	});
	$('button:submit').attr('data-track', 'submit');
};

Submit.prototype.showLoading = function() {
	$('.sub-btn').addClass('hide');
	$('#js_bookingMdloading').removeClass('hide').find('.loading_tip').text($m('SUBMITING'));
};

Submit.prototype.hideLoading = function() {
	$('.sub-btn').removeClass('hide');
	$('#js_bookingMdloading').addClass('hide');
};

Submit.prototype.submit2Pnr = function(data) {
	var url = '/twell/flight/multiway_add_demandbill_inter.jsp';
	var self = this;

	var req = $.ajax({
		url: url,
		type: "POST",
		data: "bill=" + JSON.stringify(data),
		timeout: 80 * 1000,
		beforeSend: function() {
			self.showLoading();
		},
		complete: function() {
			self.hideLoading();
		}
	});

	req.done(function(msg) {
		if (msg.status === 1) {
			$.ui.alert(msg.errmsg);
		} else {
			var hour = new Date().getHours();
			if (hour >= 9 && hour <= 21) {
				$jex.lightbox.show(self.subSuccess("恭喜您，", "我们将在2小时内与您联系"));
			} else {
				$jex.lightbox.show(self.subSuccess("", "我们将在工作日为您办理并尽快与您联系"));
			}
		}
	}).fail(function(msd) {
		$.ui.alert("提交出错,请重新提交订单！");
	});
};

Submit.prototype.subSuccess = function(title, content) {
	var obj = this.searchBox.getPostData().flight[0];
	var url = ["http://flight.qunar.com/twell/flight/Search.jsp?fromCity=", obj.fromCity, "&toCity=", obj.toCity, "&fromDate=", obj.fromDate, "&toDate=&searchType=OnewayFlight"].join("");
	return [
		'<div class="noway-pop">',
		'<h2>国际及港澳机票需求单</h2>',
		'<p class="order-info">', title, '您的需求单已经提交成功。<br /><span>', content, '敬请留意。</span></p>',
		'<p class="ok-btn-a"><a class="btn" href="', url, '"><span><b>确  定</b></span></a></p>',
		'</div>'
	].join("");
};



Submit.prototype.submitForm = function() {
	var _data = this.getPostData();
	this.submit2Pnr(_data);
};



/**
 * get-Post-Data
 * @param  null
 * @return {postData}
 */
Submit.prototype.getPostData = function() {
	var res = {};

	var flight = this.searchBox.getPostData();
	var passengers = this.passInfo.getPostData();
	var contact = this.contactInfo.getPostData();
	$.extend(true, res, flight, passengers, contact);

	return res;
};



Submit.prototype.trackErr = function(elems) {
	if (elems.length) {
		var passenger_err = false,
			contact_err = false,
			exp_err = false;

		$.each(elems, function(i, item) {
			var n = item.attr('name');
			if (n in {
				"name": "",
				"cardno": "",
				"nationality": "",
				"cardIssuePlace": ""
			}) {
				passenger_err = true;
			}
			if (n in {
				"contact": "",
				"contactMob": "",
				"contactEmail": ""
			}) {
				contact_err = true;
			}

			if (n in {
				"expresstitle": "",
				"sjr": "",
				"phone": "",
				"address": ""
			}) {
				exp_err = true;
			}
		});
		passenger_err;
		contact_err;
		exp_err;
	}
};