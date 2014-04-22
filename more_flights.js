

function MoreFlights(options) {

	$.extend(this, options);

	this.order = {
		key: 'def',
		order: null
	};

}


MoreFlights.prototype.render = function() {

	return this.T.render(this.parse());

};

MoreFlights.prototype.parse = function() {

	var _get = this.provider.get,
		trip = this.trip,
		flights = _get('flights');


	var  o = this.order;


	var data = this.flight.getMoreFlights(trip.flight_key);

	var cur = flights[trip.flight_key];

	var _data = {
		index: trip.index,
		dep_city: _get('cities', cur.dc).zh,
		arr_city: _get('cities', cur.ac).zh,
		dt_cls: o.key == 'dt' ? o.order == 'ASC' ? 'i_arr_ud_up' : 'i_arr_ud_down' : 'i_arr_ud',
		dur_cls: o.key == 'dur' ? o.order == 'ASC' ? 'i_arr_ud_up' : 'i_arr_ud_down' : 'i_arr_ud',
		list: []
	};

	$.each(data, function(i, item) {

		var flt = flights[item];
		if (!flt) return;

		var carrier = _get('carriers', flt.ca);

		var dep_airport = _get('airprots', flt.da),
			arr_airport = _get('airports', flt.aa);

		//if (!carrier || !dep_airport || !arr_airport) return;
		_data.list.push({
			index: i + 1,
			key: flt.co + '|' + flt.dd + '|' + flt.da + '-' + flt.aa,
			dep_city: _get('cities', flt.dc).zh,
			arr_city: _get('cities', flt.ac).zh,
			flight_num: flt.co,
			carrier_code: flt.ca,
			carrier: carrier.zh,
			carrier_full: carrier.full,
			plane_type: _get('planes', flt.pt).abbr,
			dep_time: flt.dt,
			arr_time: flt.at,
			dep_airport: dep_airport ? dep_airport.ab : '',
			arr_airport: arr_airport ? arr_airport.ab : '',
			dur: Flight.prototype.dur_txt(flt.dur) || '&nbsp;',
			type: '直飞',
			choose: cur.co == flt.co

		});
	});


	return _data;

};

MoreFlights.prototype.sort = function(o) {

	var data = this.flight.getMoreFlights(this.trip.flight_key);

	var flights = this.provider.get('flights');

	this.order = o;

	var key = o.key,
		order = o.order;


	data.sort(function(a, b) {

		var fa = flights[a], fb = flights[b],

			va = fa[key] || Number.MAX_VALUE, vb = fb[key] || Number.MAX_VALUE;

		if (key == 'dt') {
			va = va.replace(':', '');
			vb = vb.replace(':', '');
		}

		var delta = va - vb;

		return order == 'ASC' ? delta : -delta;


	});




};

/**
 *
 * @param {string} key
 */
MoreFlights.prototype.getNewKey = function(key) {


	var keys = this.flight.key.split('_');

	keys[this.trip.index - 1] = key;

	return keys.join('_');



};