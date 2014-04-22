/**
 *
 * @param {object} options
 * @constructor
 */
function StarRank(options) {

	$.extend(this, options);


	this.pickers = {
		dw: {
			key: "dw",
			label: "网站使用",
			score: 0,
			width: 0,
			desc: ''
		},
		db: {
			key: "db",
				label: "价格真实",
				score: 0,
				width: 0,
				desc: ''
		},
		ds: {
			key: "ds",
			label: "售后服务",
			score: 0,
			width: 0,
			desc: ''
		}
	};

	/**
	 * 点评是否展开状态
	 * @type {boolean}
	 */
	this.opened = false;
}


/**
 * 打开点评的 class
 * @type {string}
 */
StarRank.OPENED_CLASS = 'e_btn_cmt_on';


StarRank.prototype.render = function() {

	return this.T.render(this.parse());

};

StarRank.prototype.parse = function() {

	var LC = LoginControl;


	LC.checkLogin();

	var _data = {

		wrid: this.wrapper,
		star: [1,2,3,4,5],
		pickers: [this.pickers.dw, this.pickers.db, this.pickers.ds],
		isLogin: LC.isLogin,
		user_name: LC.user.name

	};


	return _data;


};

/**
 * 设置点评分数
 * @param {string} key
 * @param {number} value
 */
StarRank.prototype.set = function(key, value) {

	var picker = this.pickers[key];

	picker.score = value;

	picker.width = value * 10 * 2;

	picker.desc = this.getDesc(key, value);

};

StarRank.prototype.get = function(key) {

	return this.pickers[key].score;

};


/**
 * 打开点评
 */
StarRank.prototype.open = function() {

	this.btn.next().html(this.render()).show();

	this.btn.parent().addClass(StarRank.OPENED_CLASS);

	this.opened = true;

};

/**
 * 关闭点评
 */
StarRank.prototype.close = function() {

	this.btn.parent().removeClass(StarRank.OPENED_CLASS);
	this.btn.next().empty();

	this.opened = false;
};

/**
 * 点评校验
 * @returns {string}
 */
StarRank.prototype.check = function() {

	var s = '';

	var list = [this.pickers.dw, this.pickers.db, this.pickers.ds];

	$.each(list, function(i, picker) {
		if (!picker.score) {
			s = picker.label;
			return false; //break
		}
	});

	return s ?
		'<span class="f_warn">请选择<b>' + s + '</b>的评分.</span>' : false;


};

StarRank.prototype.submitComment = function(cmt_holder, tips) {

	var self = this;

	var callbackFnId = 'callbackId' + new Date().getTime();

	var fm = cmt_holder.find('form');
	fm[0].callback.value = 'window.parent.' + callbackFnId;

	window[callbackFnId] = function(result) {

		if (result.success) {
			tips.html('成功提交');
		} else {
			tips.html('<span class="f_warn">' + result.msg + '</span>');
		}

		setTimeout(function() {

			$('#ifmPost').attr('src', 'about:blank');
			self.close();

		}, 1000);
	};

	if ($.browser.ie) {
		var formId = fm.attr('id');
		$('#ifmPost').attr('src', "javascript:'<script>window.onload=function(){document.write(\\'<script>document.domain=\\\"qunar.com\\\";parent.document.getElementById(\"" + formId +  "\").submit();<\\\\/script>\\');document.close();};<\/script>'");
	} else {
		fm.submit();
	}
};


/**
 * 获取点评描述
 * @param {string} key
 * @param {number} value
 * @returns {string}
 */
StarRank.prototype.getDesc = function(key, value) {

	if (!value) return '';

	return {
		dw: ["无法使用","很难使用","一般般吧","使用较方便","使用很方便，赞！"],
		db: ["机票经常售完","经常遇到支付后要求加价","经常遇到支付前要求加价",
			"偶尔遇到售完或要求加价","从未遇到过售完或要求加价"],
		ds: ["服务很差劲","服务挺差的","服务一般","服务还不错","服务非常好，赞！"]
	}[key][value - 1];

};
