(function($){

    var version = '0.1.1';

$.fn.placeholder = function(){

    return $(this).each(function(){

        var $self = $(this);
        var color = $self.css("color");
        var def_text = $self.data("placeholder");
        var def_color = $self.data("placeholder-color") || "#999" ;
		var def_clsname = $self.data("placeholder-clsname");
        var def_text_align = $self.data("placeholder-align");
        var text_align = $self.css("text-align");

        if ( def_text == null ) return;

        var _isDef = function(){
            return $.trim( $self.val() ) == "" || $self.val() == def_text;
        }

		//add to input
		this.isPlaceHolderEmpty = _isDef;

		var _removeGray = function(){
			if( def_clsname ) {
				$self.removeClass( def_clsname );
			} else {
				$self.css( "color" , "" );
			}

            $self.css("text-align", text_align);
		}

		var _addGray = function(){
			if( def_clsname ) {
				$self.addClass( def_clsname );
			} else {
				$self.css( "color" , def_color );
			}

            $self.css("text-align", def_text_align);
		}

        $self.unbind(".placeholder")
        .bind("focus.placeholder", function(){
            if( _isDef() ) {
                $self.val("");
				_removeGray();
			}
        }).bind("blur.placeholder", function(){
            if( _isDef() ) {
                $self.val( def_text );
				_addGray();
            } else {
				_removeGray();
            }
        });

		//init
		this.initPlaceHolder = function(){
	        if( _isDef() ) {
                $self.val( def_text );
			    _addGray();
            } else {
			    _removeGray();
            }
        }

        this.initPlaceHolder();

    });

}

})(jQuery);


