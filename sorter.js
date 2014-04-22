

function Sorter(options) {
	$.extend(this, options);

	this.order = {
		order: "DEF",
		cls: "i_arr_ud",
		key: this.key
	};

	var self = this;

	this.el.click(function(evt) {


		var old_cls = self.order.cls;


		switch (self.order.order) {
			case 'DEF':
				self.order.order = 'ASC';
				self.order.cls = 'i_arr_ud_up';
				break;
			case 'ASC':
				self.order.order = 'DESC';
				self.order.cls = 'i_arr_ud_down';
				break;
			case 'DESC':
				self.order.order = 'DEF';
				self.order.cls = 'i_arr_ud';
				break;

		}

		$(this).find('i').removeClass(old_cls).addClass(self.order.cls);

		$(self).trigger('sort', {
			order: self.order.order,
			key: self.order.key
		});

		evt.preventDefault();

	});
}

Sorter.prototype.reset = function() {

	if (this.order.order == 'DEF') return;

	var old_cls = {
		"ASC": "i_arr_ud_up",
		"DESC": "i_arr_ud_down",
		"DEF": "i_arr_ud"
	}[this.order.order];


	this.order.order = 'DEF';
	this.order.cls = 'i_arr_ud';

	this.el.find('i').removeClass(old_cls).addClass(this.order.cls);

};