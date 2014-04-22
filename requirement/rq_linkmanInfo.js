/**
 * contact info
 *
 * @constructor
 * @param {object} opts options
 *
 */

function LinkmanInfo(opts) {
	$.extend(this, opts);
	this.elems = {};
}

LinkmanInfo.prototype.init = function(data) {
	this.render().onAfterRender();
};

LinkmanInfo.prototype.render = function() {
	$(this.holder).html(this.T.render());
	return this;
};

LinkmanInfo.prototype.onAfterRender = function() {
	this._initMap();
	this.$('name').blur(function() {
		$(this).val($.trim($(this).val()));
	});
	this.$('email').blur(function() {
		$(this).val($.trim($(this).val()));
	});
	$('[name=contactTel1]').placeholder();
	$('[name=contactTel2]').placeholder();
	$('[name=contactTel3]').placeholder();
};


LinkmanInfo.prototype.MAP = {
	"name": "contactName",
	"mob": "contactPhone",
	"email": "email",
	"ex": "contactTel",
	"ex1": "contactTel1",
	"ex2": "contactTel2",
	"ex3": "contactTel3"
};

LinkmanInfo.prototype._initMap = function() {
	var self = this;
	var holder = $(this.holder);
	$.each(this.MAP, function(k, v) {
		self.elems[k] = holder.find('[name=' + v + ']');
	})
};

LinkmanInfo.prototype.$ = function(k) {
	return this.elems[k];
};

LinkmanInfo.prototype.getDataById = function(id) {
	var data = this._contactData;
	for (var i = 0, l = data.length; i < l; i++) {
		if (data[i].id == id) return data[i];
	}
	return null;
};

LinkmanInfo.prototype.getPostData = function() {
	var res = {
		"linkman": {
			"contactName": this.parse.contactName(), //联系人部分
			"email": this.parse.email(),
			"contactPhone": this.parse.contactPhone(),
			"contactTel": this.parse.contactTel()
		}
	}
	return res;
};


LinkmanInfo.prototype.parse = {
	//联系人信息
	contactName: function() {
		var val = $("[name=contactName]").val();
		return $.trim(val);
	},

	contactPhone: function() {
		var val = $("[name=contactPhone]").val();
		return $.trim(val);
	},
	email: function() {
		var val = $("[name=email]").val();
		return $.trim(val);
	},

	contactTel: function() {
		var val1 = $("[name=contactTel1]").val(),
			val2 = $("[name=contactTel2]").val(),
			val3 = $("[name=contactTel3]").val();

		val1 = $.trim(val1) === "区号" ? "" : val1;
		val2 = $.trim(val2) === "电话号码" ? "" : val2;
		val3 = $.trim(val3) === "分机号" ? "" : val3;

		return val1 + "-" + val2 + "-" + val3;

	}
};
