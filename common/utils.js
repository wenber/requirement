if (typeof Utils === 'undefined') {
    var Utils = {};
}

(function(Utils) {

Utils.log = function() {
    if (typeof console !== 'undefined') {
       console.log.apply ?
	       console.log.apply(console, [].slice.call(arguments)) :
	       console.log([].slice.call(arguments));
    }
};

Utils.shorterString = function(str, len) {

    var arr = (str || '').split(''),
        i = 0, l = 0;

    while (i < len && arr[l]) {

        if ((/[^\x00-\xff]/).test(arr[l])) {
            i += 2;
        } else { i++; }

        l++;
    }

    return arr[l] ? str.substr(0, l) + '...' : str;
};

Utils.toDateTime = function(date, time) {

    var ds = date.split(/[-\/]/),
        y = parseInt(ds[0], 10),
        m = parseInt(ds[1], 10),
        d = parseInt(ds[2], 10);

    time = time || '';

    var ts = time.split(/:/),
        h = parseInt(ts[0], 10) || 0,
        mm = parseInt(ts[1], 10) || 0,
        s = parseInt(ts[2], 10) || 0;

    return new Date(y, m - 1, d, h, mm, s);
};

Utils.toDateString = function(date) {
    var m = date.getMonth() + 1,
        d = date.getDate();

    if (m < 10) { m = '0' + m; }
    if (d < 10) { d = '0' + d; }

    return date.getFullYear() + '-' + m + '-' + d;
}

Utils.resolveIdentityCard = function(num) {

    var len = num.length,
        arrSplit,
        y, m, d, gender; // 1 male 0 female

    if (len === 15) {

        arrSplit = num.match(/^(?:\d{6})(\d{2})(\d{2})(\d{2})(?:\d{3})$/);

        if (!arrSplit) {
            return false;
        }

        y = parseInt('19' + arrSplit[1], 10);
        m = parseInt(arrSplit[2], 10);
        d = parseInt(arrSplit[3], 10);
        gender = num.charAt(len - 1) % 2;

    } else if (len === 18) {

        //检验18位身份证的校验码是否正确。
        //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10

        var weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
            check = '10X98765432';

        for (var i = 0, temp = 0; i < 17; i++) {
            temp += num.charAt(i) * weight[i];
        }

        if (check.charAt(temp % 11) !== num.charAt(17).toUpperCase()) {
            return false;
        }

        arrSplit = num.match(/^(?:\d{6})(\d{4})(\d{2})(\d{2})(?:\d{3})(?:[0-9]|X)$/i);

        if (!arrSplit) {
            return false;
        }

        y = parseInt(arrSplit[1], 10);
        m = parseInt(arrSplit[2], 10);
        d = parseInt(arrSplit[3], 10);

        gender = num.charAt(len - 2) % 2;

    }

    var date = new Date(y, m - 1, d);

    if (y !== date.getFullYear() || m !== date.getMonth() + 1 || d !== date.getDate()) {
        return false;
    }

    return {
        gender: gender,
        birth: Utils.toDateString(date)
    };
};

function treatIdentity(str) {

    var ret = Utils.resolveIdentityCard(str);

    if (!ret) {
        return str;
    }


    if (str.length === 18) {
        return str.replace(/^(\d{4})\d{11}(\d{2}[\da-z])$/i, '$1***********$2');
    } else if (str.length === 15) {
        return str.replace(/^(\d{4})\d{8}(\d{3})$/, '$1********$2');
    }

    return str;
}

function treatEmail(str) {

    var m = str.split('@');

    if (!m[1]) { return m[0]; }

    var pre = m[0].replace(/^(...)(.+)$/, function(a, p, s) {
            return p + Array(s.length + 1).join('*');
        });

    return [pre, m[1]].join('@');
}

Utils.treatSensitiveInfo = function(type, str) {

    if (!str) { return ''; }

    switch (String(type)) {
        case 'identity':
            return treatIdentity(str);
        case 'email':
            return treatEmail(str);
        case 'mobile':
            return str.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
        default:
            return str.replace(/^(..)(.+)(..)$/, function(a, p, m, s) {
                return p + Array(m.length + 1).join('*') + s;
            });
    }
};

})(Utils);
