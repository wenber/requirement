/**
 * Created with JetBrains WebStorm.
 * User: dimu.feng@
 * Date: 12-5-28
 * Time: 下午7:01
 * To change this template use File | Settings | File Templates.
 */
(function(){

    var ICON = {
	    'success': 'ico_succ_m',
	    'warn': 'ico_del_m',
	    'question': 'ico_warn_m',
	    'loading': 'loading'
    };

    function getCls( key ){
        return ICON[ key ] || '';
    }

    function mergeConf(type, info , spec ){
        if( typeof info !== 'string' ) spec = info || {};
        var def = {
            textLarge: typeof info === 'string' ? info : '',
            textSmall: '',
            textSmallCls : 'relt_errortip',
            icon : 'warn',
            wrapCls : 'relat_tip',
            btns : [{
                txt : spec.ok_txt || '确定',
                cls : spec.ok_cls || 'btn_gray', //btn_blue
                cbfun : spec.ok_call || $.noop
            }],
            closeBtn : true
        };
        if( type === 'confirm'){
            def.icon = 'question';
            def.btns.push({
                txt : spec.cancel_txt || '取消',
                cls : spec.cancel_cls || 'btn_gray',
                cbfun : spec.cancel_call || $.noop
            });
        }
        return $.extend(def , spec );
    }

    function createAlert( type , info , spec ){
        var conf , dia , wrap , btnWrap;
        conf = mergeConf( type , info , spec || {} );

        if( !conf.textSmall ){
            if( conf.btns === 0 ){ //没有按钮的提示层
                conf.wrapCls += ' ptrbl30';
            }else{
                conf.wrapCls += ' ptl110';
            }
        }

        var html = [
            '<div class="'+ conf.wrapCls +'">',
            conf.textLarge ? '<div class="b_warn_pop"><div class="e_warn_ico"><i class="' + getCls(conf.icon) + '"></i> </div><div class="e_warn_inf">' + conf.textLarge + '</div></div>' : '',
            conf.textSmall ? '<p class="'+ conf.textSmallCls +'">'+ conf.textSmall +'</p>' : '',
            '<p class="relt_btn" node-type="btns"></p>',
            '</div>'
        ].join('');

        wrap = $( html );
        btnWrap = $('[node-type="btns"]', wrap);
        dia = $.ui.dialog({
            closeBtn : conf.closeBtn,
            isEsc : conf.isEsc === false ? false : true
        });
        dia.setContent( wrap );
        dia.show().setMiddle();

        $.each(conf.btns , function( i ,obj ){
            //第二个按钮开始要加上 ml13 class
            $('<button class="'+ obj.cls+ ( i > 0 ? ' ml13' : '' ) +'"><b><b>'+ obj.txt +'</b></b></button>').click( function(){
                var cb = obj.cbfun.call(dia);
                if( cb !== false ) dia.hide();
            }).appendTo( btnWrap );
        });
        conf = html = wrap = btnWrap = null;
        return dia;
    }

    $.ui.alert = function( info , spec ){
        return createAlert('alert', info , spec );
    };

    $.ui.confirm = function( info , spec ){
        return createAlert('confirm', info , spec );
    };

    $.ui.loadingAlert = function( info , spec ){
        spec = $.extend( {
            icon:'loading',
            isEsc: false,
            closeBtn : false,
            btns : []
        } , spec ) ;
        return $.ui.alert( info || '正在提交中，请稍侯……' , spec );
    };

}());