(function(window, jQuery, undefined){

var DEFAULT_CHECKER_NAME = "DEFAULT_CHECKER",
    DEFAULT_CHECKER_MESSAGE = "THANK_YOU_FOR_CHOICE",
    DEFAULT_JVALID_NAME = "jvalid",
    DEFAULT_JVALID_RULER = "jvalid-ruler",
	DEFAULT_JVALID_DELAY = "jvalid-delay",
    DEFAULT_JVALID_SELECTOR = "[data-jvalid-ruler]";


// require jQuery 1.5.2 or above.
var Deferred = jQuery.Deferred,
    Trim = jQuery.trim,
    Noop = jQuery.noop,
    Each = jQuery.each,
    Type = function(s){ return Object.prototype.toString.call(s).slice(8, 9); },
    Checkers = {};

function set_checker (checker){
    if (checker && checker.name) {

        var name = checker.name;

        if (Checkers[name]) {
            window.Utils && Utils.log("Checker " + name + " has been override.");
        }
        Checkers[name] = checker;
    }
}

function get_checker (name) {
    return Checkers[name];
}

jQuery.extend({
    checker: {
        addItem: set_checker,
        getItem: get_checker
    }
});

Checkers[DEFAULT_CHECKER_NAME] = {
    name: DEFAULT_CHECKER_NAME,
    message: DEFAULT_CHECKER_MESSAGE,
    check: function(str, rule){
        rule.result(true);
    }
};

var Rule = function(){};

Rule.prototype = {
    _getNext: function(){
        var self = this,
            i = self._i + 1;

        self._c = self._l[i] ? Checkers[self._l[i]] : null;

        if (!self._c && self._l[i]) {
            window.Utils && Utils.log("Checker " + self._l[i] + " do not exsit.");
        }

        self._i = i;

        return self._c;
    },
    _checkNext: function(){
        var self = this;

        if(self._isChecked()){ return; }

        var next = self._getNext();

        if(next){
            next.check(self._txt, this);
            return true;
        }

        return false;
    },
    _checked: function(){
        var self = this;

        if (!self._c) {
            return;
        }

        var key = self._c.name;

        self._t[key] = 1;
    },
    _isChecked: function(){
        var self = this;

        if (!self._c) {
            return false;
        }

        var key = self._c.name;

        return !!self._t[key];
    },
    _formatRuler: function(ruler){
        var type = Type(ruler),
            self = this;

        if (type === "S") {
            self._l = Trim(ruler).split(/ +/);
        } else {
            self._l = type === "A" ? ruler : [];
        }

    },
    check: function(ruler, text, config){
        var self = this;

        config = config || {};

        self._oncheck = config.oncheck || Noop;
        self._onchecked = config.onchecked || Noop;
        self._ontimeout = config.ontimeout || Noop;
        self._timeout = parseInt(config.timeout, 10) || 0;

        self._formatRuler(ruler);

        // used checker
        self._t = [];
        // deferred
        self._d = Deferred();
        // string to check
        self._txt = text;
        // current checker
        self._c = null;
        // result of check 0 false 1 true -1 checking -2 timeout
        self._r = -1;
        // checker index;
        self._i = -1;

        self._oncheck();

        // attach promise but no resolve to this
        self._d.promise(self);

        self.done(function(T){

            if (T === -2) {
                self._ontimeout(T);
            } else {
                self._onchecked(T, self._c ? self._c.message : "");
            }

            self._r = Number(T);

        });

        if (self._timeout) {
            setTimeout(function(){
                if (self._r === -1) {
                    self.end(-2);
                }
            }, self._timeout);
        }

        self.next(true);

    },
    status: function(){
        return this._r;
    },
    next: function(T){
        var self = this;

        if(!self._checkNext()){
            self.end(T);
        }
        self._checked();
    },
    result: function(T){
        var self = this;

        if(T && self._checkNext()){
            return;
        } else {
            self.end(T);
        }

        self._checked();
    },
    end: function(T){
        var self = this;

        if (self._r !== -1) { return; }

        self._d.resolve(T);
    }
};

jQuery.jvalid = { each: {}, group: {} };

function _checkIt(self){
    return !self.is(":disabled") && self.is(":visible");
}

jQuery.fn.jvalid = function(config){
    /**
     * oncheck
     * onchecked
     * ontimeout
     * timeout
     * reader
     * checkIt
     */

    return this.each(function(){

        var self = $(this);

        config = $.extend({}, jQuery.jvalid.each, config);

        var checkIt = config.checkIt || _checkIt;

        if (!checkIt(self)) {
            // clear ruler when not pass;
            self.data(DEFAULT_JVALID_NAME, null);
            return;
        }

        var rule = self.data(DEFAULT_JVALID_NAME);
	    var delay = self.data(DEFAULT_JVALID_DELAY);

        if (!rule) {
            rule = new Rule();
            self.data(DEFAULT_JVALID_NAME, rule);
        }

        var ruler = self.data(DEFAULT_JVALID_RULER),
            obj = {}, content;

	    // fix focusout prior blur with qsuggest
	    delay ? setTimeout(check, 10) : check();

	    function check() {
		    if (Type(config.reader) === "F") {
			    content = config.reader(self);
		    } else {
			    content = self.val();
		    }

		    $.each(config, function(k, val){

			    if (typeof val === "function") {
				    obj[k] = function(){
					    val.apply(self, [].slice.apply(arguments));
				    };
			    } else {
				    obj[k] = val;
			    }
		    });

		    rule.check(ruler, content, obj);
	    }
    });

};

var config_keys = "oncheck onchecked ontimeout timeout";

function setOptions(config){

    config = config || {};

    var groupConfig = {},
        eachConfig = {};

    $.each(config_keys.split(" "), function(i, item){

        if (config[item]) {
            groupConfig[item] = config[item];
        }

        if (config["each_" + item]) {
            eachConfig[item] = config["each_" + item];
        }

    });

    return { each: eachConfig, group: groupConfig };
}

jQuery.jvalid.each = {
    onchecked: function(T, msg){
        var jInput = this;

        if (T) {
            jInput.jvalidTip("correct");
        } else {
            jInput.jvalidTip(msg);
        }

    }
};

function all(args){
    for (var i = 0, l = args.length; i < l; i++) {
        if (!args[i]) {
            return false;
        }
    }
    return true;
}

function rulerSwitch(select, config){
    var yselect = select.data("YSELECTOR");

    if (select.data(DEFAULT_JVALID_RULER) && yselect && yselect.option("input").is(":visible")) {

        select.jvalid({
            checkIt: function(){ return true; },
            reader: function(){ return yselect.val(); },
            onchecked: function(T, msg){
                var jInput = yselect.option("jquery");

                if (T) {
                    jInput.jvalidTip("reset");
                } else {
                    jInput.jvalidTip(msg);
                    jInput.removeClass("e_error");
                    jInput.jvalidTip("width");
                }

            }
        });
    } else if (select.data("placeholder")) {
        select.jvalid({
            reader: function(){ return select[0].isPlaceHolderEmpty() ? "" : select.val(); }
        });
    } else {
        select.jvalid(config);
    }

}

jQuery.fn.jvalidForm = function(config){

    var conf = setOptions(config);


    this.each(function(){
        var self = $(this);

        if (!self.is("form")) {
            return;
        }

        self.delegate(DEFAULT_JVALID_SELECTOR, "focusout." + DEFAULT_JVALID_NAME, function(e){

            var target = e.target,
                jTar = $(target);

            jTar.jvalid(conf.each);

        });

        /**
         * only for YSELECTOR
         */

        var yselect = $.fn.yselector;

        if (yselect) {
            $(yselect.events).bind("blur." + DEFAULT_JVALID_NAME, function(e, yselect, data, select){
                rulerSwitch(select, conf.each);
            });
        }

        self.submit(function(){

            if (conf.group.oncheck) {
                if (conf.group.oncheck.call(null) === false) {
                    return;
                }
            }

            var rules = [];
	        var elems = [];

            $(DEFAULT_JVALID_SELECTOR).map(function(i, item){

                var select = $(item);

                rulerSwitch(select, conf.each);

                var r = select.data(DEFAULT_JVALID_NAME);

                if (r) {
                    rules.push(r);
	                r._r == 0 && elems.push(select);
                }
            });

            var res = true;

            $.when.apply(null, rules).then(function() {
                var result = all(arguments);

                if (conf.group.onchecked) {
                    res = conf.group.onchecked.call(null, result, elems);
                }
            });
            return res;
		});

        // TODO timeout support
    });


    return this;
};

})(this, jQuery);