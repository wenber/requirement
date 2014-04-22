(function($){

    $.fn.jvalidTip = function(msg){

        return this.each(function(){

            var jInput = $(this); //input框
            var jSpan = jInput.parent(); //input框外面的span，用来标识正确和错误标识
            var tipper = jInput.data("tipper");

            if (msg === "correct") {

                jInput.jvalidTip("reset");
                jSpan.addClass("e_correct");

            } else if (msg === "reset") {

                if (tipper) { tipper.hide(); }
                jSpan.removeClass("e_error e_correct disble textbox_disable");

            } else if (msg === "disable"){

                jInput.jvalidTip("reset");
                jInput.addClass("disble");
                jSpan.addClass('textbox_disable');

            } else if (msg === "width"){

                var width = jSpan.outerWidth();

                tipper.find(".inner").css("width", width);

            } else {

                
                jSpan.removeClass("e_correct").addClass("e_error");

                if (!tipper) {

                    var width = jSpan.outerWidth();

                    var index = jInput.data('jvalid-zIndex');

                    tipper = $(['<div class="e_error_notice" ', index ? 'style="z-index:' + index + '"' : ''  ,'>',
                                '    <div class="inner" style="width:106px;">',
                                '        <div class="box orange_layer">',
                                '            <div class="jt_layer"><cite class="bot"></cite><cite class="top"></cite></div>',
                                '            <div class="content"></div>',
                                '        </div>',
                                '    </div>',
                                '</div>'].join(""));

                    jInput.data("tipper", tipper);

                    tipper.find(".inner").css("width", width);

                    jSpan.after(tipper);
                }

                tipper.find(".content").text(msg);
                tipper.show();

            }
        });
    };

})(jQuery);

