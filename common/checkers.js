(function($) {
    "use strict";


    // todo
    var checkers = [];
    $.each(checkers, $.checker.addItem);

    $.checker.addItem({
        name: "only_number",
        message: "只能输入数字",
        check: function(str, rule) {

            str = $.trim(str);

            if (/^\d*$/.test(str)) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });
    $.checker.addItem({
        name: "allow_empty",
        message: "",
        check: function(str, rule) {

            str = $.trim(str);

            if (str) {
                rule.next(false);
            } else {
                rule.end(true);
            }
        }
    });
    $.checker.addItem({
        name: 'ch_eng',
        message: '必须是汉字或者英文字符',
        check: function(str, rule) {
            str = $.trim(str);
            if (/^[\u4E00-\u9FFFa-zA-Z]*$/i.test(str)) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "empty",
        message: "不能为空",
        check: function(str, rule) {

            str = $.trim(str);

            if (str) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "first_name_empty",
        message: $m('FIRST_NAME_EMPTY'),
        check: function(str, rule) {

            str = $.trim(str);

            if (str) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "last_name_empty",
        message: $m('LAST_NAME_EMPTY'),
        check: function(str, rule) {

            str = $.trim(str);

            if (str) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "first_name_err",
        message: $m('NAME_ERR'),
        check: function(str, rule) {
            str = $.trim(str);
            if (/^(\s?[a-z])+$/i.test(str)) {
                rule.result(true);
            } else {
                rule.result(false);
            }

        }
    });



    $.checker.addItem({
        name: "last_name_err",
        message: $m('NAME_ERR'),
        check: function(str, rule) {
            str = $.trim(str);
            if (/[^a-z\s]/i.test(str)) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });

    $.checker.addItem({
        name: "last_name_space",
        message: $m('LAST_NAME_SPACE'),
        check: function(str, rule) {
            str = $.trim(str);
            if (/\s/.test(str)) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });

    $.checker.addItem({
        name: "tf_first_name_space",
        message: $m('TF_FIRST_NAME_SPACE'),
        check: function(str, rule) {
            str = $.trim(str);
            if (/\s/.test(str)) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });

    $.checker.addItem({
        name: "tf_last_name_space",
        message: $m('TF_LAST_NAME_SPACE'),
        check: function(str, rule) {
            str = $.trim(str);
            if (/\s/.test(str)) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });

    $.checker.addItem({
        name: "name_empty",
        message: $m('NAME_EMPTY'),
        check: function(str, rule) {

            str = $.trim(str);

            if (str) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "name_err",
        message: $m('TF_CONTACT_NAME_ERR'),
        check: function(str, rule) {
            str = $.trim(str);
            if (/^[a-z]+\/([a-z]+\s?)+$/i.test(str)) {
                rule.result(true);
            } else {
                rule.result(false);
            }

        }
    });


    $.checker.addItem({
        name: "card_empty",
        message: $m('CARD_EMPTY'),
        check: function(str, rule) {
            str = $.trim(str);
            rule.result( !! str);
        }
    });

    $.checker.addItem({
        name: "mobile_err",
        message: $m('MOBILE_ERR'),
        check: function(str, rule) {
            str = $.trim(str);
            if (/^1\d{10}$/.test(str)) {
                rule.result(true);
            } else {}
            rule.result(false);
        }
    });

    $.checker.addItem({
        name: "mobile_empty",
        message: $m('MOBILE_EMPTY'),
        check: function(str, rule) {
            str = $.trim(str);
            if (str) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "empty_email",
        message: $m('EMPTY_EMAIL'),
        check: function(str, rule) {
            str = $.trim(str);

            if (str) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "email_err",
        message: $m('EMAIL_ERR'),
        check: function(str, rule) {
            str = $.trim(str);

            if (/^([a-zA-Z0-9\._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-]+)+$/.test(str)) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "country_err",
        message: $m('COUNTRY_ERR'),
        check: function(str, rule) {
            var self = this;
            $.getJSON('http://www.qunar.com/suggest/countrysearch.jsp?callback=?', {
                q: str
            }, function(res) {
                var data = res.result[0];
                if (data) {
                    try {
                        var txt = data.display.split('(')[0];
                        var code = data.display.match(/(\w{2})\)$/)[1];
                        if (txt == str) {
                            rule.result(true);
                            rule.code = code;
                        } else {
                            rule.result(false);
                        }
                    } catch (e) {
                        throw (e)
                    }

                } else {}
                rule.result(false);
            });
        }
    });

    $.checker.addItem({
        name: "ch_name",
        message: "您输入的格式不正确，拼音后面不能再输入汉字，请用拼音替代",
        check: function(str, rule) {

            str = $.trim(str);

            if (!/^[\u4e00-\u9fa5].*$/i.test(str)) {
                rule.result(true);
            } else {
                if (/^[\u4e00-\u9fa5]+[a-z]*$/i.test(str)) {
                    rule.result(true);
                } else {
                    rule.result(false);
                }
            }
        }
    });

    $.checker.addItem({
        name: "invoice_empty",
        message: $m('INVOICE_EMPTY'),
        check: function(str, rule) {

            str = $.trim(str);

            rule.result( !! str);
        }
    });

    $.checker.addItem({
        name: "en_name",
        message: "姓名过短，请输入正确姓名",
        check: function(str, rule) {

            str = $.trim(str);

            if (/^[\u4e00-\u9fa5].*$/i.test(str)) {
                rule.result(true);
            } else {
                if (str.replace('/', '').length < 3) {
                    rule.result(false);
                } else {
                    rule.result(true);
                }
            }
        }
    });

    $.checker.addItem({
        name: "en_name1",
        message: "英文后不能使用汉字",
        check: function(str, rule) {

            str = $.trim(str);

            if (/^[\u4e00-\u9fa5].*$/i.test(str)) {
                rule.result(true);
            } else {
                if (/[^\/ a-z]/i.test(str)) {
                    rule.result(false);
                } else {
                    rule.result(true);
                }
            }
        }
    });

    $.checker.addItem({
        name: "en_name2",
        message: "请您严格按照办理登机手续时所持有效证件上的姓名填写。填写英文姓名请在姓与名之间用\"/\"分隔，并按照证件上的姓名顺序填写。",
        check: function(str, rule) {

            str = $.trim(str);

            if (/^[\u4e00-\u9fa5].*$/i.test(str)) {
                rule.result(true);
            } else {
                if (!/^[a-z]+\/[a-z ]*$/i.test(str)) {
                    rule.result(false);
                } else {
                    rule.result(true);
                }
            }
        }
    });

    $.checker.addItem({
        name: "toolong",
        message: "您的姓名过长，民航系统无法输入，您输入姓名中前54个字符（包括“/”）或27个汉字即可",
        check: function(str, rule) {

            var len = length(str);

            if (len > 54) {
                rule.result(false);
            } else {
                rule.result(true);
            }
        }
    });

    $.checker.addItem({
        name: "strangeword",
        message: "输入中含有生僻字，请换成拼音",
        check: function(str, rule) {

            var self = this;

            $.getJSON("http://ws.qunar.com/cnCheck.jsp?callback=?", {
                "p": str
            }, function(data) {

                var fs = [],
                    pys = [];

                $.each(data.result, function(i, val) {
                    if (val.t === 1) {
                        fs.push(val.f);
                        pys.push(val.py.replace(/\d+/g, ""));
                    }
                });

                self.message = "您的姓名中包含生僻字“" + fs.join("") + "”，请将“" + fs.join("") + "”用拼音“" + pys.join("") + "”替代";

                rule.result(!fs.length);
            });
        }
    });

    $.checker.addItem({
        name: "ID",
        message: "身份证号码错误",
        check: function(str, rule) {

            str = $.trim(str);

            if (isID(str)) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "email",
        message: "email格式错误",
        check: function(str, rule) {

            str = $.trim(str);

            if (isEmail(str)) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "mobile",
        message: "手机号码格式错误",
        check: function(str, rule) {

            str = $.trim(str);

            if (isMobile(str)) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "id2-12",
        message: "此产品仅限儿童(2-12岁)购买",
        check: function(str, rule) {

            str = $.trim(str);

            var d;

            if (str.length === 15) {
                d = "19" + str.substring(6, 12);
            } else {
                d = str.substring(6, 14);
            }

            d = d.replace(/(\d{4})(\d\d)(\d\d)/, "$1-$2-$3");

            var d1 = Utils.toDateTime(d);
            var d2 = Utils.toDateTime(d);

            var y12 = d1.setFullYear(d1.getFullYear() + 12);
            var y2 = d2.setFullYear(d2.getFullYear() + 2);

            if (y12 > UserStatus.DEPART && y2 < UserStatus.DEPART) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "2-12",
        message: "此产品仅限儿童(2-12岁)购买",
        check: function(str, rule) {

            var d = $.trim(str);

            var d1 = Utils.toDateTime(d);
            var d2 = Utils.toDateTime(d);

            var y12 = d1.setFullYear(d1.getFullYear() + 12);
            var y2 = d2.setFullYear(d2.getFullYear() + 2);

            if (y12 > UserStatus.DEPART && y2 < UserStatus.DEPART) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "gt15",
        message: "婴儿客票请直接到航空公司预订",
        check: function(str, rule) {

            var d = $.trim(str);

            d = Utils.toDateTime(d);

            var d15 = d.setDate(d.getDate() + 15);

            if (d15 <= UserStatus.NOW) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "idgt15",
        message: "婴儿客票请直接到航空公司预订",
        check: function(str, rule) {

            str = $.trim(str);

            var d;

            if (str.length === 15) {
                d = "19" + str.substring(6, 12);
            } else {
                d = str.substring(6, 14);
            }

            d = d.replace(/(\d{4})(\d\d)(\d\d)/, "$1-$2-$3");

            d = Utils.toDateTime(d);

            var d15 = d.setDate(d.getDate() + 15);

            if (d15 <= UserStatus.NOW) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "date",
        message: "格式必须为yyyy-mm-dd，如2008-02-03",
        check: function(str, rule) {

            var d = $.trim(str);

            if (isDate(d)) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "length20",
        message: "长度不能超过20位",
        check: function(str, rule) {

            var d = $.trim(str);

            if (d.length > 20) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });

    $.checker.addItem({
        name: "length5",
        message: "长度不能超过5位",
        check: function(str, rule) {

            var d = $.trim(str);

            if (d.length > 5) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });

    $.checker.addItem({
        name: "length15",
        message: "长度不能超过15位",
        check: function(str, rule) {

            var d = $.trim(str);

            if (d.length > 15) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });
    $.checker.addItem({
        name: "length10",
        message: "长度不能超过10位",
        check: function(str, rule) {

            var d = $.trim(str);

            if (d.length > 10) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });

    $.checker.addItem({
        name: "length30",
        message: "长度不能超过30位",
        check: function(str, rule) {

            var d = $.trim(str);

            if (d.length > 100) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });

    $.checker.addItem({
        name: "length50",
        message: "长度不能超过50位",
        check: function(str, rule) {

            var d = $.trim(str);

            rule.result(d.length <= 50);

        }
    });

    $.checker.addItem({
        name: "length100",
        message: "长度不能超过100位",
        check: function(str, rule) {

            var d = $.trim(str);

            if (d.length > 100) {
                rule.result(false);
            } else {
                rule.result(true);
            }

        }
    });

    $.checker.addItem({
        name: "passport",
        message: "护照号码格式错误",
        check: function(str, rule) {

            var d = $.trim(str);

            if (/^[a-zA-Z0-9]{1,20}$/.test(d)) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "otherID",
        message: "号码格式错误",
        check: function(str, rule) {

            var d = $.trim(str);

            if (/^[a-zA-Z0-9]{1,50}$/.test(d)) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "city",
        message: "必须选择行程单或者保单邮寄地址",
        check: function(str, rule) {

            var d = $.trim(str);

            if (d) {
                rule.result(true);
            } else {
                rule.result(false);
            }
        }
    });

    $.checker.addItem({
        name: "cardNum",
        message: "证件号码不能包含汉字",
        check: function(str, rule) {

            str = $.trim(str);

            if (/[\u4e00-\u9fa5]/g.test(str)) {
                rule.result(false);
            } else {
                rule.result(true);
            }
        }
    });



    /*
     A @ B . C
     A 原则上少做限制，因为各家服务商可能规则不太一样 A-Z a-z 0-9 - _ .
     B 域名规范 A-Z a-z 0-9 开头 后面可以是 A-Z a-z 0-9 _ -
     C 型如 com | com.cn

     考虑每个字段加个长度限制
    */

    function isEmail(str) {
        return (/^[\w\.\-\+]+@[a-zA-Z0-9][\w\-]*\.[a-zA-Z]+(\.[a-zA-Z]+)?$/).test(str);
    }

    function isMobile(str) {
        return (/^1\d{10}$/).test(str);
    }

    function isID(num) {
        return !!Utils.resolveIdentityCard(num);
    }

    function isDate(str) {
        var re = /^([12]\d{3})(\-)(\d{2})\-(\d{2})$/,
            dateList = re.exec(str);

        if (!dateList) {
            return false;
        }

        var y = dateList[1] | 0,
            m = dateList[3] | 0,
            d = dateList[4] | 0;

        if (m > 12 || m < 1 ||
            d < 1 || d > 31) {
            return false;
        }

        return new Date(y, m - 1, d).getDate() === d;
    }

    function length(str) {
        var len = 0,
            db = /[^\x00-\xff]/,
            cha = str.split("");

        for (var i = 0; i < cha.length; i++) {
            if (db.test(cha[i])) {
                len += 2;
            } else {
                len += 1;
            }
        }

        return len;
    }


})(jQuery);