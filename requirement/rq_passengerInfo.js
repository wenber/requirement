/**
 * passenger info
 * manange passenger
 * @constructor
 * @param {object} opts options
 *
 */

function PassengerInfo(opts) {
	$.extend(this, opts);
};



/**
 * intialize the passenger info block
 * @param data {object} data  the original data object
 *
 */
PassengerInfo.prototype.init = function() {
	this.render().onAfterRender();
};


/**
 * render the html
 * @param {object} data
 * @return {PassengerInfo} for chain
 */
PassengerInfo.prototype.render = function() {
	$(this.holder).html(this.T.render());
	return this;
};

/**
 * store the passengers
 * @type {array} Passenger
 */
PassengerInfo.prototype.passengerList = [];
/**
 * do things on after rendered such as binding events
 *
 */
PassengerInfo.prototype.onAfterRender = function() {
	this.bindEvent();
	this.add(false);

};

/**
 * bindEvent
 */
PassengerInfo.prototype.bindEvent = function() {
	var self = this;

	$(this.holder).delegate('#js_btn_add', 'click', function(event) {
		event.preventDefault();
		self.add(false);
	});

	$(this.passengerHolder).delegate('input[name=firstName], input[name=lastName]', 'focus', function() {
		$(".p_tips_cont").hide();
		$(this).closest('.peo-info-m').find(".p_tips_cont").show();

	}).delegate('.x_remove', 'click', function(event) {
		event.stopPropagation();
		$(this).closest('.p_tips_cont').hide();

	}).delegate('span.info-ico', 'click', function(event) {
		event.stopPropagation();
		$(this).next('div.p_tips_cont').is("visible") ?
			$(this).next('div.p_tips_cont').hide() : $(this).next('div.p_tips_cont').show();

	}).delegate('.opt_remove', 'click', function(event) {
		event.preventDefault();
		self.remove(this);
	});

};

/**
 * add new passenger
 * @param {boolean} isFirst  is insert into first
 */
PassengerInfo.prototype.add = function(isFirst) {
	this.num++;
	var config = {
		num: this.num,
		opts: this.num === 1 ? "清空" : "删除"
	};

	if (this.num === 10) {
		$.ui.alert('至多9个乘机人');
		this.num = 9;
		return;
	}

	var passenger = new Passenger(config, this.num);
	this.passengerList.push(passenger);

	$(this.passengerHolder).append(passenger.element);
	if (this.num === 2) {
		$(this.passengerHolder).find('.opt_remove').text("删除");
	}

};

/**
 * remove passenger
 * @param {Passenger} passenger
 */
PassengerInfo.prototype.remove = function(passenger) {

	var self = this,
		$remove = $(passenger),
		$wrap = $remove.closest(".peo-info"),
		index = $(".peo-info").index($wrap);
	this.passengerList.splice(index, 1);
	if ($remove.text() == "删除") {
		// 修改后面状态
		$wrap.nextAll("div.peo-info").each(function() {
			var num = $(this).data("num"),
				$this = $(this);

			$this.data("num", num - 1);
			$this.find(".js_h3_p").text("第" + (num - 1) + "位乘客");
			$this.find("input[name*=gender]").each(function() {
				$(this).attr("name", "gender" + (num - 1));
			});
		});
		$wrap.remove();
		self.num--;

	} else { // 清空
		$wrap.remove();
		self.num--;
		self.add(false);
	}

	if (this.num === 1) {
		$(this.passengerHolder).find('.opt_remove').text("清空");
	}
};

/**
 * check all input value
 *
 */
PassengerInfo.prototype.check = function() {
	var sn = this._data.seatNum;
	var maxSeat = isNaN(sn) ? this.maxSeatNum : Math.min(this.maxSeatNum, this._data.seatNum);
	var num = this.passengerList.length;

	if (num >= this.maxSeatNum) {
		this.showNotice($m('NINE_SEAT'));
		return false;
	}
	if (num == maxSeat) {
		this.showNotice($m('MAX_SEAT', {
			max: maxSeat
		}));
		return false;
	} else if (num < 1) {
		this.showNotice($m('LEAST'));
		return false;
	} else if (num > maxSeat) {
		this.showNotice($m('DELETE_SEAT', {
			max: maxSeat
		}));
		return false;
	}
	this.showNotice($m('QUERY_SEAT_END', {
		max: maxSeat
	}));
	return true;

};

PassengerInfo.prototype.checkBirthday = function() {
	var res = [];
	$.each(this.passengerList, function(i, item) {
		var bthd_chk = item.checkBirthday();
		bthd_chk && res.push(bthd_chk);
	});
	return res.length ? res : null;
};

PassengerInfo.prototype.checkExpiryDate = function() {
	var res = [];
	$.each(this.passengerList, function(i, item) {
		var chks = item.checkExpiryDate();
		chks && res.push(chks);
	});
	return res.length ? res : null;
};

/**
 * get the number of child passenger
 * @return {number}
 */
PassengerInfo.prototype.getChdNum = function() {
	var num = 0;
	$.each(this.passengerList, function(i, item) {
		item.isChild() && num++;
	});
	return num;
};

/**
 * get the number of adult passenger
 * @return {number} num
 */
PassengerInfo.prototype.getNum = function() {
	var num = 0;
	$.each(this.passengerList, function(i, item) {
		item.isChild() || num++;
	});
	return num;
};
/**
 * check the number of children is less than or equal to adults
 * @return {boolean}
 */
PassengerInfo.prototype.checkChildNum = function() {
	return this.getChdNum() <= 3;
};



PassengerInfo.prototype.getPostData = function() {
	var res = [],
		obj = {};
	$.each(this.passengerList, function(i, item) {
		res.push(item.getPostData(item.element));
	});
	obj.passenger = res;
	return obj;
};

/**
 * get the data which sending to user center
 * @return {object}
 */
PassengerInfo.prototype.getPostUserData = function() {
	if (!$('#js_savePass').is(':checked')) {
		return [];
	}
	var res = [];
	$.each(this.passengerList, function(i, item) {
		res.push(item.getPostUserData());
	});
	return res;
};