
function WrapperList(options) {

	$.extend(this, options);

	// 是否全部展示
	this.state = false;

}

WrapperList.prototype.render = function() {


	return this.T.render(this.parse());


};


WrapperList.config = {

	"services": {
		s1: "CATA认证",
		s2: "7×24服务",
		s3: "去哪儿帮您填",
		s4: "支付价出票",
		s5: "退改签保障",
		s6: "赠送保险",
		s7: "服务保障",
		s8: "免费邮寄",
		s9: "担保通"
	},

	"servicesDesc": {
		s1: "获得《中国民用航空运输销售代理业务资格认可证书》",
		s2: "提供7×24小时服务",
		s3: "支持使用在去哪儿网填写的乘机人信息",
		s4: "承诺按照支付价格出票",
		s5: "严格执行航空公司退改签规定",
		s6: "承诺购买机票赠送保险",
		s7: "服务保障",
		s8: "购买机票可免费邮寄行程单",
		s9: "担保通实现金牌机票服务安全保障"
	}
};

WrapperList.prototype.get = function(wrid) {

	var wrappers = this.provider.get('priceData', this.flight.key);

	return wrappers ?  wrappers[wrid] : null;

};

WrapperList.prototype.getBookingUrl = function(wrid) {

	var wrapper = this.get(wrid),
		p = this.provider.param;

	var url = '/booksystem/booking.jsp?';

	var param = {

		from: p('from'),
		ex_track: p('ex_track')

	};


	return [url, wrapper['bu'], '&', $.param(param)].join('');


};


WrapperList.prototype.parse = function() {

	var flight = this.flight,
		_get = this.provider.get,
		data = _get('priceData', flight.key),
		allPrice = flight.list.allPrice;

	var round = Math.round;

	var self = this;

	if (!data) {
		return;
	}

	var _data = {
		lowpr: flight.prInfo.pr,
		flight_key: flight.key,
		list: []
	};

	var num = 0;

	$.each(data, function(wrid, wrapper) {

		var vendor = _get('vendors', wrid);

		if (!vendor) return;

		wrapper.vendor = vendor;

		var star = vendor.star,
			lv = star.lv,
			starRank = flight.getStarRank(wrid),
			tax_type = wrapper.txtype;

		_data.list.push({
			id: wrid,
			name: vendor.name,
			rank: wrapper.rank,
			pr: wrapper.pr,
			price_label: allPrice && tax_type ? '总价' : '票价',
			tax: wrapper.tax,
			tax_label: self.getTaxLabel(tax_type, allPrice),
			show_tax: (tax_type == 1 || tax_type == 3) && !allPrice,
			star: {
				kd: (round(lv.kd * 10) / 10).toFixed(1),
				dw: (round(lv.dw * 10) / 10).toFixed(1),
				db: (round(lv.db * 10) / 10).toFixed(1),
				ds: (round(lv.ds * 10) / 10).toFixed(1),
				ts: (round(lv.ts * 10) / 10).toFixed(1),
				kd_w: round(lv.kd * 10 * 2),
				dw_w: round(lv.dw * 10 * 2),
				db_w: round(lv.db * 10 * 2),
				ds_w: round(lv.ds * 10 * 2),
				ts_w: round(lv.ts * 10 * 2),
				count: star.count,
				opened: starRank ? starRank.opened : false
			},

			starRank: starRank ? starRank.render() : '',

			icon: function() {

					return self.getIcon(vendor);

			},

			up_time: function() {

				var ut = wrapper.ut;

				if (ut > 0) {
					return self.getUpTime(ut) + '前更新';
				} else {
					return '10分钟前更新'
				}

			},
			v3: function() {

				var html = self.getDbt(vendor);

				if (!html) {
					html = self.getAllday(vendor);
				}

				return html || '&nbsp;';


			},
			v4: function() {

				var html = self.getDbt(vendor);

				if (!html) {
					html = '&nbsp;'
				} else {
					html = self.getAllday(vendor);
				}

				return html || '&nbsp;';

			}
		});

		num++;

	});

	_data.list.sort(function(a, b) {
		return a.rank - b.rank;
	});

	$.each(_data.list, function(i, item) {
		item.visible = i < 16 || self.state;
	});

	_data.show_more_btn = num > 16;

	return _data;

};


WrapperList.prototype.getDbt = function(vendor) {

	var assistant = vendor.services['s4'],
		dbt = vendor.services['s9'];

	var s = '';

	if (assistant) {

		var label = WrapperList.config.services['s9'],
			desc = WrapperList.config.servicesDesc['s9'];

		var ie6 = $.browser.ie && parseInt($.browser.version, 10) <= 6;

		if (dbt) {
			s = ['<div class="vlc_wp_db">',
					'<i class="vlc_ref"></i>',
					'<div class="vlc_cont">',
						'<div class="t_sv">',
						'<span class="hv_dbt"', ie6 ? (' title="'+ desc +'"') : '' ,
						'><i class="ico_724"></i>', label, '</span>',
						this.getTips(desc),
						'</div>',
					'</div>',
				'</div>'].join('')
		}

	}

	return s;


};

WrapperList.prototype.getAllday = function(vendor) {

	var service = vendor.services['s2'],
		label = WrapperList.config.services['s2'],
		desc = WrapperList.config.servicesDesc['s2'];

	var s = '';

	var ie6 = $.browser.ie && parseInt($.browser.version, 10) <= 6;

	if (service) {

		s = ['<div class="vlc_wp_db">',
			'<i class="vlc_ref"></i>',
			'<div class="vlc_cont">',
				'<div class="t_sv">',
					'<span class="hv_dbt"', ie6 ? (' title="'+ desc +'"') : '' ,
					'><i class="ico_724"></i>', label, '</span>',
					this.getTips(desc),
					'</div>',
				'</div>',
		'</div>'].join('')

	}

	return s;

};


WrapperList.prototype.getTips = function(desc) {

	return ['<div class="p_tips_cont">',
				'<div class="p_tips_wrap">',
					'<div class="p_tips_arr p_tips_arr_t">',
						'<p class="arr_o">◆</p>',
						'<p class="arr_i">◆</p>',
					'</div>',
					'<div class="p_tips_content">',
						'<p>', desc, '</p>',
					'</div>',
				'</div>',
			'</div>'].join('');

};

WrapperList.prototype.getIcon = function(vendor) {

	var services = vendor.services;

	var cata = services['s1'],
		icon = vendor.info.icon;

	if (cata) {
		var label = WrapperList.config.services['s1'],
			desc = WrapperList.config.servicesDesc['s1'];
		return '<i title="' + desc + '" class="ico_certify s1"></i>';
	} else if (icon && icon != 'none') {

		var obj = null;

		switch (icon) {
			case 'cata':
				obj = {'key':'ico_cata','text':'CATA认证','title':'获得《中国民用航空运输销售代理业务资格认可证书》'};
				break;
			case 'official':
				obj = {'key':'ico_official','text':'官网','title':'航空公司官网购票，权威服务，值得信赖。'};
				break;
			case 'direct':
				obj = {'key':'ico_direct','text':'直营','title':'航空公司直营旗舰店，实时出票，官方服务保障，购票放心。'};
				break;
		}

		return obj ?  ('<i class="' + obj.key + '" title="' + obj.title + '">' + obj.text + '</i>') : '&nbsp;';

	} else {
		return '&nbsp;';
	}

};

WrapperList.prototype.getUpTime = function(time) {

	var language = {
		SECOND:"秒",
		MILLISECOND: "毫秒",
		MINUTE:"分钟",
		HOUR:"小时",
		DAY:"天",
		YEAR:"年"
	};

	var _ms = time % 1000;
	var _s = (time - _ms) % 60000;
	var _min = (time - _s * 1000 - _ms) % 3600000;
	var _hour = (time - _min * 60000 - _s * 1000 - _ms) % (24 * 3600000);
	var _day = (time - _hour * 3600000 - _min * 60000 - _s * 1000 - _ms) % (24 * 3600000);
	var utStr = "";
	if (time < 1000)
	//utStr = time + language.MILLISECOND;
		utStr = 1 + language.SECOND;
	else
	if (time < 60000)
		utStr = parseInt(time / 1000) + language.SECOND;
	else
	if (time < 3600000)
		utStr = parseInt(time / 60000) + language.MINUTE;
	else
	if (time < (24 * 3600000))
		utStr = parseInt(time / 3600000) + language.HOUR;
	else
	if (time < (365 * 24 * 3600000))
		utStr = parseInt(time / (24 * 3600000)) + language.DAY;
	else
		utStr = parseInt(time / (365 * 24 * 3600000)) + language.YEAR;
	return utStr;

};

WrapperList.prototype.getTaxLabel = function(tax_type, allPrice) {

	var tax_type = allPrice && tax_type ?  4 : tax_type;

	var label = {
		"0": "未含税费",
		"1": "税费",
		"2": "已含税",
		"3": "参考税费",
		"4": "总价"
	};


	return label[tax_type];




};



