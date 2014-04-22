/**
 *
 * @param {object} config
 * @constructor
 */
function Passenger(config, num) {
	$.extend(this, config);
	this.elems = {};
	this.clouser = null;
	this.element = this.createElement(num);
};

/**
 *
 * map the element's name
 * @enum {string}
 */
Passenger.prototype.MAP = {
	"first_name": "firstName", // 乘机人姓名
	"last_name": "lastName",

	"passenger_type": "ageType", // 乘机人类型

	"birthday": "birthday",
	"bthd_y": "birthday_year", // 生日 年
	"bthd_m": "birthday_month", // 生日 月
	"bthd_d": "birthday_day", // 生日 日

	"gender": "gender", // 性别
	"nationality": "nationality", // 国籍
	"card_type": "cardType", // 证件类型
	"card_num": "cardNum", // 证件号

	"expiry": "cardExpired",
	"expiry_y": "cardExpired_year", // 证件有效期 年
	"expiry_m": "cardExpired_month", // 证件有效期 月
	"expiry_d": "cardExpired_day", // 证件有效期 日
	"issue_place": "cardIssuePlace" // 证件签发地
};

/**
 * create passenger DOM element and initialize
 * @return {jQuery}
 */
Passenger.prototype.createElement = function(num) {

	var el = $(QTMPL.rq_passenger.render(this));
	var self = this;
	this.clouser = el;

	this._initMap(el);

	// 成人默认年
	var DEFAULT_YEAR = 1980;

	// 可选最早年
	var START_YEAR = 1900;

	//当前年
	var cur_year = SERVER_TIME.getFullYear();
	//儿童年龄范围
	var CHILD_LIMIT = 12;

	//证件有效期可选最大年
	var MAX_VALID_YEAR = 2050;

	// 出生年 1900-现在  默认1980
	var bthd_y = $('[name=birthday_year]', el);
	var cacheArr = [];

	for (var i = START_YEAR; i <= cur_year; i++) {
		cacheArr.push('<li><a href="javascript:;">' + i + '</a></li>');
	}
	bthd_y.closest(".d-arraw").prev("span").text(DEFAULT_YEAR);
	bthd_y.next("ul").html(cacheArr.join(""));

	//证件有效期年的范围 现在-2050
	var expiry_y = $('[name=cardExpired_year]', el);
	cacheArr.length = 0;
	for (i = cur_year; i <= MAX_VALID_YEAR; i++) {
		cacheArr.push('<li><a href="javascript:;">' + i + '</a></li>');
	}
	expiry_y.closest(".d-arraw").prev("span").text(cur_year);
	expiry_y.next("ul").html(cacheArr.join(""));
	expiry_y.val(cur_year);

	var expiry_m = $('[name=cardExpired_month]', el);
	var expiry_d = $('[name=cardExpired_day]', el);
	var cur_mon = this.parseTime(SERVER_TIME.getMonth() + 1);
	var cur_day = this.parseTime(SERVER_TIME.getDate() + 1)

	//设置有效期显示的时间
	expiry_m.closest(".d-arraw").prev("span").text(cur_mon);
	expiry_m.val(cur_mon);
	expiry_d.closest(".d-arraw").prev("span").text(cur_day);
	expiry_d.val(cur_day);

	this.bindEvent();
	this._initDate(cur_year, cur_mon, "cardExpired_day", el);

	self.init();
	return el;
};

/**
 * @description  init passenger info
 */
Passenger.prototype.init = function() {
	var el = this.clouser;

	//地名搜索提示
	this._initSuggest(this.$('issue_place'));
	this._initSuggest(this.$('nationality'));
	//输入框默认文字提示
	el.find('[name=firstName]').placeholder();
	el.find('[name=lastName]').placeholder();
	//隐藏域时间设置
	this.setBirthday(el);
	this.setCardExpired(el);
};

Passenger.prototype.bindEvent = function() {
	var self = this;
	$("#passenger_list").delegate('.sel-arraw,.sel-input', 'click', function(event) { //触发下拉菜单
		event.stopPropagation();
		$(document).trigger("click");
		var $self = $(this).closest('.peobox');
		$self.find("b").addClass("b-up");
		$self.find('.d-arraw').show();

	}).delegate('.d-arraw a', 'click', function(event) { //下拉选中
		event.preventDefault();
		event.stopPropagation();

		var $self = $(this);
		var el = $(this).closest('.peo-info');
		var $selfWrap = $self.closest('.peobox');
		$selfWrap.find('.sel-input').text($self.text());
		$selfWrap.find('.sel-arraw>b').removeClass("b-up");
		$selfWrap.find(".d-arraw").hide();
		var hide = $selfWrap.find('[type=hidden]');
		hide.val($self.text()).trigger("change", [hide.val()]);
		self.checkValidDay();
		self.setBirthday(el);
		self.setCardExpired(el);

	}).delegate('[name=birthday_year],[name=birthday_month],[name=cardExpired_year],[name=cardExpired_month]', 'change', function(event, val) {
		var clouser = $(this).closest('.peo-info');
		var name = $(this).attr("name");
		switch (name) {
			case "birthday_year":
				self._initDate(val, clouser.find("[name=birthday_month]").val(), "birthday_day", clouser);
				self.setBirthday(clouser);
				break;
			case "birthday_month":
				self._initDate(clouser.find("[name=birthday_year]").val(), val, "birthday_day", clouser);
				self.setBirthday(clouser);
				break;
			case "cardExpired_year":
				self._initDate(val, clouser.find("[name=cardExpired_month]").val(), "cardExpired_day", clouser);
				self.setCardExpired(clouser);
				break;
			case "cardExpired_month":
				self._initDate(clouser.find("[name=cardExpired_year]").val(), val, "cardExpired_day", clouser);
				self.setCardExpired(clouser);
				break;
		}
	});


	$(document).bind("click", function(event) {
		$(this).find(".d-arraw").hide();
		$(this).find('.sel-arraw>b').removeClass("b-up");
		if ($(event.target).closest('.d-tr1').length == 0) {
			$(".p_tips_cont").hide();
		}
	});
};

/**
 * @description when day is more than the last day of this month
 */
Passenger.prototype.checkValidDay = function() {
	var b = this.clouser.find("[name=birthday_day]");
	var e = this.clouser.find("[name=cardExpired_day]");
	var b_day = b.val();
	var e_day = e.val();

	var b_max_day = b.next("ul").children('li').length;
	var e_max_day = e.next("ul").children('li').length;

	if (b_day > b_max_day) {
		b.val("01");
		b.closest('.d-arraw').prev("span.sel-input").text("01");
	}
	if (e_day > e_max_day) {
		e.val("01");
		e.closest('.d-arraw').prev("span.sel-input").text("01");
	}
};

Passenger.prototype.parseTime = function(time) {
	if (time.toString().length == 1) {
		time = "0" + time.toString();
	}
	return time;
};

/**
 * intialize the map
 * @param {jQuery} el
 * @private
 */
Passenger.prototype._initMap = function(el) {

	var self = this;
	$.each(this.MAP, function(k, v) {
		self.elems[k] = el.find('[name=' + v + ']');
	});
};

Passenger.prototype._initDate = function(y, m, dayName, clouser) {

	var daysOfMonth = function(y, m) {
		return [
			31, (!(y % 4) && y % 100) || !(y % 400) ? 29 : 28,
			31, 30, 31, 30, 31, 31, 30, 31, 30, 31
		][m - 1];
	};
	var d = daysOfMonth(y, m),
		arrDay = [];
	for (var i = 1; i < d + 1; i++) {
		if (i < 10) {
			arrDay.push('<li><a href="javascript:;">0' + i + '</a></li>');
		} else {
			arrDay.push('<li><a href="javascript:;">' + i + '</a></li>');
		}
	}
	clouser.find("[name=" + dayName + "]").next("ul").html(arrDay.join(""));
};

/**
 * get the DOM element
 * @param {string} k the key
 * @return {jQuery} jQuery object
 */
Passenger.prototype.$ = function(k) {
	return this.elems[k] || jQuery();
};

Passenger.prototype.setBirthday = function(clouser) {
	var y = clouser.find("[name=birthday_year]").val();
	var m = clouser.find("[name=birthday_month]").val();
	var d = clouser.find("[name=birthday_day]").val();

	clouser.find("[name=birthday]").val(y + "-" + m + "-" + d);
};


Passenger.prototype.setCardExpired = function(clouser) {
	var y = clouser.find("[name=cardExpired_year]").val();
	var m = clouser.find("[name=cardExpired_month]").val();
	var d = clouser.find("[name=cardExpired_day]").val();
	clouser.find("[name=cardExpired]").val(y + "-" + m + "-" + d);
};
var cardTypeMap = {
	"护照": "PP",
	"回乡证": "HX",
	"台胞证": "TB",
	"港澳通行证": "GA",
	"国际海员证": "HY",
	"大陆居民往来台湾通行证": "TW"
};
var genderMap = {
	"男": "M",
	"女": "F"
};

var ageTypeMap = {
	"成人>12岁": "0",
	"儿童>2岁": "1"
};
Passenger.prototype.parse = {
	firstName: function(clouser) {
		var val = clouser.find("[name=firstName]").val();
		return $.trim(val);
	},

	lastName: function(clouser) {
		var val = clouser.find("[name=lastName]").val();
		return $.trim(val);
	},

	nationality: function(clouser) {
		return clouser.find("[name=nationality]").val();
	},

	gender: function(clouser) {
		var val = clouser.find("[name^=gender]:checked").val();
		return genderMap[val];
	},

	ageType: function(clouser) {
		var val = clouser.find("[name=ageType]").val();
		return ageTypeMap[val];
	},

	birthday: function(clouser) {
		return clouser.find("[name=birthday]").val();
	},

	cardType: function(clouser, map) {
		var val = clouser.find("[name=cardType]").val();
		if (map) {
			return cardTypeMap[val];
		} else {
			return val;
		}
	},

	cardNum: function(clouser) {
		return clouser.find("[name=cardNum]").val();
	},

	cardIssuePlace: function(clouser) {
		return clouser.find("[name=cardIssuePlace]").val();
	},

	cardExpired: function(clouser) {
		return clouser.find("[name=cardExpired]").val();
	}

};
Passenger.prototype.getPostData = function(clouser) {
	return {
		"firstName": this.parse.firstName(clouser), // 乘机人姓名
		"lastName": this.parse.lastName(clouser),
		"nationality": [this.parse.nationality(clouser) || "中国", this.$('nationality').data('jvalid').code || 'CN'], // 国籍
		"gender": this.parse.gender(clouser), // 性别
		"ageType": this.parse.ageType(clouser), // 乘机人类型
		"birthday": this.parse.birthday(clouser),
		"cardType": [this.parse.cardType(clouser, false), this.parse.cardType(clouser, true)], // 证件类型
		"cardNum": this.parse.cardNum(clouser), // 证件号
		"cardExpired": this.parse.cardExpired(clouser),
		"cardIssuePlace": [this.parse.cardIssuePlace(clouser) || "中国", this.$('issue_place').data('jvalid').code || 'CN'] //证件签发地
	};
};

Passenger.prototype.getcardExpired = function() {
	return this.parse.cardExpired(this.clouser);
};

Passenger.prototype.getBirthday = function() {
	return this.parse.birthday(this.clouser);
};

Passenger.prototype.getName = function() {
	return this.clouser.find("[name=lastName]").val() + "/" + this.clouser.find("[name=firstName]").val();
};

Passenger.prototype.isChild = function() {
	return Number(this.parse.ageType(this.clouser));
};


/**
 * @description getTakeoffDate  根据参数获取起飞时间
 * @param  {string} type ["max"  or "min"]
 * @return {Date}      起飞时间
 */
Passenger.prototype.getTakeoffDate = function(type) {
	var takeoffArr = $("form[name=fli_pass_link]").find("[name=fromDateMulti]");

	var timeInit = Utils.toDateTime(takeoffArr.first().val());
	var max_day = timeInit,
		min_day = timeInit;

	for (var i = 1, len = takeoffArr.length; i < len; i++) {
		var time = Utils.toDateTime(takeoffArr.eq(i).val());
		if (max_day < time) {
			max_day = time;
		}
		if (min_day > time) {
			min_day = time;
		}
	}
	return type === "max" ? max_day : min_day;
};
/**
 * 儿童：出生日期小于2岁，大于12岁，
 *      计算航班起飞时间（如果是往返航班，则为用户回程航班起飞年月日期）当天此人年龄
 *
 * travelFusion 成人校验(大于12岁)
 * 成人和留学生：出生日期大于当前时间
 * @return {string|null} error string or null
 */
Passenger.prototype.checkBirthday = function() {

	var str = this.getBirthday();
	var date = Utils.toDateTime(str);
	var passenger = this.getName();

	var server_date = Utils.toDateTime(Utils.toDateString(SERVER_TIME));
	// var takeoffDate = this.getTakeoffDate("min");


	if (date > server_date) {
		return $m('PASSENGER') + '<b>' + passenger + '</b>' + $m('BTHD_ERR');
	} else {
		var rangeStart = this.getTakeoffDate("min");
		rangeStart.setYear(rangeStart.getFullYear() - 12);
		var rangeEnd = this.getTakeoffDate("min");


		rangeEnd.setYear(rangeEnd.getFullYear() - 2);
		if (this.isChild()) {

			if (date < rangeStart || date > rangeEnd) {
				return $m('PASSENGER') + '<b>' + passenger + '</b>' + $m('CHD_BTHD');
			}

		} else if (date > rangeStart) {
			return $m('PASSENGER') + '<b>' + passenger + '</b>' + $m('FORCE_ADULT');
		} else {
			return null;
		}
	}
};

Passenger.prototype.checkExpiryDate = function() {
	var str = this.getcardExpired();
	var date = Utils.toDateTime(str);
	var takeoffDate = this.getTakeoffDate("max");

	if (date < takeoffDate) {
		return $m('PASSENGER') + '<b>' + this.getName() + '</b>' + $m('EXPIRY_DATE_ERR');
	} else {
		return null;
	}
};

Passenger.prototype._initSuggest = function(el) {
	var self = this;
	el.qsuggest({
		ajax: {
			url: "http://www.qunar.com/suggest/countrysearch.jsp?q=*&callback=?",
			dataType: "jsonp",
			cache: false
		},
		on: {
			"q-suggest-show": function() {
				el.bind('keydown.kd', function(e) {
					(e.keyCode == 13) && e.preventDefault();
				});
			},
			"q-suggest-hide": function(e) {
				el.unbind('keydown.kd');
			}
		},
		delay: 200,
		render: function(val) {
			return val;
		},
		reader: function(data) {
			// debugger
			var userInput = data.userInput;

			var reg = new RegExp('(' + userInput + ')', 'i');

			var res = $.map(data.result, function(item) {
				var dis = item.display;
				try {
					var code = dis.match(/(\w{2})\)$/)[1];
				} catch (e) {
					throw (e);
				}


				return {
					txt: '<a href="#">' + item.display.replace(reg, '<span class="highlight">$1</span>') + '</a>',
					val: item.display.split('(')[0],
					type: 0
				};
			});

			res.unshift({
				txt: '<span class="tip">输入国家名的中文/英文（简写）</span>',
				val: '',
				type: 1
			});

			if (res.length == 1) {
				res.push({
					txt: '<div class="findno">对不起，找不到<span class="highlight">' + userInput + '</span><br />请重新输入</div>',
					val: "",
					type: 1
				})
			}
			return res;
		},
		width: 200,
		container: el.next().find('div')

	}).focus(function() {
		el.next().removeClass('hide');
		el.jvalidTip('reset');
		el.val('');
	}).blur(function() {
		el.next().addClass('hide');
		el.val($.trim(el.val()));
	});
};