/**
 *
 * 过滤
 * @param options
 * @constructor
 */
function Filter(options) {

	$.extend(this, options);

	this.data = {};

	this.cur = {};

	this.update(options.data);

	this.bindEvent();
	
}

Filter.prototype.render = function() {

	var data = this.data;

	var self = this;

	if ($.isEmptyObject(data)) return;

	var cur = this.cur[this.key];

	var list = [];

	this.size = 0;

	$.each(data, function(k, item) {

		list.push(item);

		self.size++;

		if (cur) item.checked = cur.indexOf(item.value.toString()) >= 0;

	});


	if (this.size == 1) {

		return;

	}

	// fix ie sort
	this.key != 'fcarrier' && list.sort(function(a, b) {
		return a.value - b.value;
	});

	this.holder.append(this.T.render({
		name: self.name,
		key: self.key,
		list: list,
		i: self.i
	}));

};


Filter.prototype.has = function() {

	return this.size > 1;

};

Filter.prototype.bindEvent = function() {

	var self = this;

	this.holder.on('click', this.getSelector(), function() {

//		$(self).trigger('fi.click', {
//			key: self.key,
//			value: self.get()
//		});


		$(self).trigger('filter', self.get());

	});

};

Filter.prototype.update = function(data) {

	var self = this;

	if (!data) return;

	$.each(data, function(i, item) {

		self.data[item.label + '|' + item.value] = item;

	});


	this.holder.find('[data-filter=' + this.key + ']').remove();

	this.render();

};

Filter.prototype.get = function() {

	var o = {},
		v = [];

	this.holder.find(this.getSelector(true)).each(function(i, item) {
		v.push($(item).val())
	});

	o[this.key] = v.join(',');

	this.cur = o;

	return o;

};

Filter.prototype.getSelector = function(flag) {
	return '[data-filter=' + this.key + '] input:checkbox' +
		(flag ? ':checked' : '');
};

