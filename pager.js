/**
 * pager view
 * @param options
 * @constructor
 */

function Pager(options) {

	$.extend(this, options);

	this.render();


	var self = this;

	this.holder.on('click', 'a', function() {

		self.gotoPage($(this).data('page'));

	});
	
}


/**
 * render pagination
 */
Pager.prototype.render = function() {

	var info = this.get();

	this.holder.html(function() {

		var s = [];

		if (info.current != 0) {
			s.push('<a href="#" data-page="', info.current - 1  ,'">上一页</a>')
		}

		for (var i = 0; i < info.total; i++) {


			if (i == info.current) {
				s.push('<em>', i + 1 ,'</em>')
			} else {
				s.push('<a href="#" data-page="', i ,'">', i + 1 ,'</a>');
			}

		}

		if (info.current != info.total - 1 && info.total > 1) {
			s.push('<a href="#" data-page="', info.current + 1 ,'">下一页</a>');
		}

		return s.join('');

	});

};



Pager.prototype.update = function() {


	this.render();


};

/**
 *
 * @param {number} p
 */
Pager.prototype.gotoPage = function(p) {


	this.set('current', p);

	$(this).trigger('change_page', this.get());

};

Pager.prototype.get = function() {
	return this.data;
};

Pager.prototype.set = function(key, value) {

	this.data[key] = value;

};