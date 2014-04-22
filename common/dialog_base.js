/**
 * Created with JetBrains WebStorm.
 * User: dimu.feng@
 * Date: 12-5-29
 * Time: 下午2:31
 * To change this template use File | Settings | File Templates.
 */
(function ($) {
    if (!$.kit) $.kit = {};
    if (!$.module) $.module = {};
    if (!$.ui) $.ui = {};

    var DropContent = (function () {
        var that = {} , $node;
        var create = function () {
            if (!$node) {
                $node = $('<div style="width: 950px;margin: 0 auto;height:0;position: relative;z-index: 999999;"></div>');
                $node.insertBefore($(':first', document.body));
            }
        };

        that.offset = function () {
            create();
            return $node.offset();
        };

        that.size = function () {
            create();
            return [ $node.width() , $(window).height() ];
        };

        that.getNode = function () {
            create();
            return $node;
        };

        that.getNodeOffset = function (el) {
            var offset = that.offset() , nOfs = el.offset();
            return {
                left:nOfs.left - offset.left,
                top:nOfs.top - offset.top
            };
        };

        return function () {
            return that;
        };
    })();

    $.module.layer = function (template) {
        var dropContent = DropContent();
        var outer = $(template).appendTo(dropContent.getNode()).hide() , inner = $('[node-type=inner]', outer);
        var that = {} , event = $(that) , sizeCache;

        that.show = function () {
            outer.show();
            event.trigger('lay_show');
            return that;
        };

        that.hide = function () {
            outer.hide();
            event.trigger('lay_hide');
            return that;
        };

        that.getOuter = function () {
            return outer;
        };

        that.getInner = function () {
            return inner;
        };

        /**
         * 返回layer容器的宽度和window的高度，计算位置是相对layer容器的
         * @return {Array}
         */
        that.getWrapSize = function () {
            return dropContent.size();
        };

        /**
         * 获取相对容器的定位left,top
         * @param node
         */
        that.getWrapOffset = function (node) {
            return dropContent.getNodeOffset(node);
        };

        that.getSize = function (isFlash) {
            if (isFlash || !sizeCache) {
                sizeCache = [ outer.width() , outer.height() ];
            }
            return sizeCache;
        };

        that.getDom = function (key) {
            return  $('[node-type=' + key + ']', outer);
        };

//        that.getPosition = function (key) {
//            //获取它相对容器的位置
//            return outer.position();
//        };

        that.setPosition = function (pos) {
            outer.css(pos);
            return that;
        };


        return that;
    };

    function Reuse(createFn, spec) {
        this._cache = [];
        this._cFn = createFn;
    }

    Reuse.prototype = {
        constructor:Reuse,
        _create:function () {
            var ret = this._cFn();
            this._cache.push({ 'store':ret, 'used':true });
            return ret;
        },
        getOne:function () {
            var cache = this._cache;
            for (var i = 0, len = cache.length; i < len; i += 1) {
                if (cache[i].used === false) {
                    cache[i].used = true;
                    return cache[i].store;
                }
            }
            return this._create();
        },
        _setStat:function (obj, stat) {
            $.each(this._cache, function (index, item) {
                if (obj === item.store) {
                    item.used = stat;
                    return false;
                }
            });
        },
        setUsed:function (obj) {
            this._setStat(obj, true);
        },
        setUnused:function (obj) {
            this._setStat(obj, false);
        },
        getLength:function () {
            return this._cache.length;
        }
    };

    $.kit.Reuse = Reuse;


    $.module.dialog = (function () {

        return function (template, spec) {
            if (!template) throw 'dialog no template';
            var layer , that , conf , box , content , close , diaHide , beforeHideFn , show , hide;

            var init = function () {
                conf = $.extend({}, spec);
                layer = $.module.layer(template);
                box = layer.getOuter();
                content = layer.getInner();
                close = layer.getDom('close').click(function () {
                    diaHide();
                });
            };

            init();
            show = layer.show;
            hide = layer.hide;
            diaHide = function (isForce) {
                if (typeof beforeHideFn === 'function' && !isForce) {
                    if (beforeHideFn() === false) {
                        return false;
                    }
                }
                hide();
                return that;
            };

            that = layer;

            that.show = function () {
                show();
                return that;
            };
            that.hide = diaHide;

            that.setMiddle = function () {

                var win = that.getWrapSize() , //获取弹层容器的大小
                    dia = layer.getSize(true) ,
                    s_top = $(window).scrollTop();

                var pos = {
                    top:s_top + ( win[1] - dia[1] ) / 2,
                    left:( win[0] - dia[0] ) / 2
                };

                //不能放到页面区域上面
                if (pos.top < s_top) pos.top = s_top;
                if (pos.left < 0) pos.left = 0;

                return that.setPosition(pos);

            };

            that.setClose = function (isClose) {
                close[ isClose ? 'show' : 'hide' ]();
            };

            that.setContent = function (cont) {
                if (typeof cont === 'string') {
                    content.html(cont);
                } else {
                    content.append(cont);
                }
                return that;
            };

            that.clearContent = function () {
                content.empty();
                return that;
            };
            that.setBeforeHideFn = function (fn) {
                beforeHideFn = fn;
            };
            that.clearBeforeHideFn = function () {
                beforeHideFn = null;
            };

            return that;

        };
    }());


    $.ui.dialog = (function () {
        var TEMP = '<div class="poplayer_box" node-type="outer" style="display:block;left:420px;top:10px;">' +
            '     <span class="close" node-type="close"></span>' +
            '     <div class="poplayer_inner" node-type="inner"></div>' +
            '</div>';
        var cache = null;
        var clearDialog = function (dia) {
            dia.clearContent();
            if (cache) cache.setUnused(dia);
        };

        var createDialog = function () {
            var dia = $.module.dialog(TEMP);
            $(dia).bind('lay_show',function () {
                $.ui.mask.show();
            }).bind('lay_hide', function () {
                    $.ui.mask.hide();
                });
            return dia;
        };

        var dialogs = [];
        var removeToList = function (dia) {
            var temp = [];
            $.each(dialogs, function (i, obj) {
                if (obj !== dia) temp.push(obj);
            });
            dialogs = temp;
        };

        /****一个当前弹出层的列表*****/
        var bindDialogsList = function (dia, spec) {
            var doHide = function () {
                removeToList(dia);
                if (!spec.isHold) { //如果不是隐藏时关闭移除事件
                    $(dia).unbind('lay_hide', doHide);
                    $(dia).unbind('lay_show', doShow);
                }
            };

            var doShow = function () {
                dialogs.push(dia); //将最新的插入队列中
            };
            $(dia).bind('lay_hide', doHide).bind('lay_show', doShow);
        };

        var bindKeyCode = function(){
            //有弹层时处理 回车 tab禁用 ESC关闭层的逻辑
            $(document).keydown(function (evt) {
                if (dialogs.length === 0) return;
                var dia = dialogs[ dialogs.length - 1 ];
                var keyCode = evt.keyCode , target = evt.target , nodeName = target.nodeName, rinput = /^input|textarea$/i;
                var isContains = $.contains(dia.getOuter()[0], target); //事件触发源是否在弹层内

                if (keyCode === 27) { //ESC
                    if (!dia.isEsc) return;  //不允许esc关闭
                    //如果是在弹层内的表单元素按ESC不退出，如果是button元素要退出
                    if (rinput.test(nodeName) && isContains && target.type !== 'button') return;
                    dia.hide();
                } else if (keyCode === 13 || keyCode === 9) { //回车和tab
                    if (!isContains) { //如果触发源不在容器内阻止默认行为
                        evt.preventDefault();
                    }
                }
            });
        };



        return function (spec) {
            spec = $.extend({
                isEsc:true,
                'isHold':false,
                closeBtn:true,
                width:500
            }, spec || {});
            var isHold = spec.isHold;
            if (!cache) {
                bindKeyCode(); //绑定document的keyDown事件
                cache = new $.kit.Reuse(createDialog);
            }
            var that = cache.getOne();
            that.getInner().css('width', spec.width);
            that.setClose(spec.closeBtn);
            if (!isHold) {
                var doHide = function () {
                    $(that).unbind('lay_hide', doHide);
                    clearDialog(that);
                };
                $(that).bind('lay_hide', doHide);
            }
            that.isEsc = spec.isEsc;
            bindDialogsList(that, spec);
            return that;
        };

    }());

    $.ui.mask = (function () {
        var mask , showCount = 0 , _timer , noFix = $.browser.msie && $.browser.version === '6.0';

        function setMask() {
            if (noFix) {
                mask.css({
                    width:$(document).width(),
                    height:Math.max($(document).height(), $(window).height()),
                    zIndex:800
                });
            } else {
                mask.css({
                    position:'fixed',
                    zIndex:800
                });
            }
        }

        function doResize() {
            clearTimeout(_timer);
            _timer = setTimeout(setMask, 500);
        }

        function onSize() {
            if (noFix) {
                $(window).bind('resize', doResize);
            }
        }

        function offSize() {
            $(window).unbind('resize', doResize);
        }

        function create() {
            mask = $('<div class="poplayer_bg"></div>').appendTo(document.body);
            setMask();
            return mask;
        }

        var that = {
            show:function () {
                showCount++;
                if (showCount > 1) return;
                if (!mask) create();
                onSize();
                mask.show();
            },
            hide:function () {
                if (!mask || showCount <= 0) return;
                showCount--;
                if (showCount === 0) {
                    offSize();
                    mask.hide();
                }
            }
        };

        return that;
    })();

})(jQuery);
