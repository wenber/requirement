(function($){
	/**
		Event :
			q-suggest-user-action
			q-suggest-hide
			q-suggest-show
			q-suggest-dispose

	*/


	/**
        usage : 
            bind :
                detect_oninput.bind( element , callback )
            unbind : 
                detect_oninput.unbind( element , callback )
            set value safely , prevent to call back :
                detect_oninput.set( element , value )
            
            ------
            callback parameter:
                callback( new_value , old_value)

        warn :
            in some browser , it may call the function back when the input's value was changed by javascript unless using detect_input.set()
    */
    var detect_oninput = (function(){
        var _h = 'data-detect-oninput', _cache = {} , _check = {} , $$guid = 1 , $$eid = 1;
        var _bindEvent = function( element , type , handler , _guid ){
            if( element.addEventListener )
                element.addEventListener( type , handler , false );
            else if( element.attachEvent )
                element.attachEvent( 'on' + type , handler );
            
            ( _cache[ _guid ] || ( _cache[ _guid ] = [] ) ).push( { 't' : type , 'h' : handler } );
        };
        var _removeEvent = function( element , _guid ){
            if( !_cache[ _guid ] )
                return;
            for( var i = 0 , _evt  ; _evt = _cache[ _guid ][i] ; i++ )
                if( element.removeEventListener )
                    element.removeEventListener( _evt['t'] , _evt['h'] , false);
                else if( element.detachEvent )
                    element.detachEvent( 'on' + _evt['t'] , _evt['h'] );
            delete _cache[ _guid ];
        };

        var _create_checker = function( input , callback ){
            var _old = input.value;
            var _checker = function(){
                var _new;
                if( ( _new = input.value ) !== _old ){
                    if( _checker._sleep !== true )
                        callback.call( input , _new , _old );
                    _old = input.value;
                }
            }
            return _checker;
        };

        var ua = navigator.userAgent.toLowerCase();

        return {
            version : '1.3',
            bind : function( input , callback ){
                var _eid , _guid = callback[ _h ];
                if( !_guid )
                    callback[ _h ] = _guid = $$guid++;
                if( !( _eid = input.getAttribute( _h ) ) )
                    input.setAttribute( _h , _eid = "" + $$eid++ );

                var _cb = _create_checker( input , callback );
                if( 'oninput' in input && !/opera/.test( ua ) )
                    _bindEvent( input , 'input'  , _cb , _guid );
                else{
                    var _check_handler;
                    _bindEvent( input , 'focus' , function(){
                        if( !_check_handler )
                            _check_handler = setInterval( _cb , 100);
                    } , _guid );
                    _bindEvent( input , 'blur' , function(){
                        if( _check_handler ){
                            clearInterval( _check_handler );
                            _check_handler = null;
                        }
                    } , _guid );
                }
                _check[ _guid ] = { eid : _eid , checker : _cb };
                return input;
            } ,
            unbind : function( input , callback ){
                if( callback[ _h ] ){
                    _removeEvent( input ,  callback[ _h ] );
                    delete _check[ callback[ _h ] ];
                }
                return input;
            },
            set : function( input , value ){
                var _eid = input.getAttribute( _h );
                if( _eid ){
                    var _checkers = [];
                    for( var _x in _check )
                        if( _check[ _x ][ 'eid' ] === _eid ){
                            _checkers.push( _check[ _x ][ 'checker' ] );
                            _check[ _x ][ 'checker' ]._sleep = true;
                        }
                    input.value = value;
                    for( var i = 0 , len = _checkers.length ; i < len ; i++ ){
                        _checkers[i].call( input );
                        _checkers[i]._sleep = false;
                    }
                }else
                    input.value = value;
            }
        };
    })();


	/*
		plugin detect oninput end
	*/

	$.qsuggest = { version : '1.2' };
	
	var ROOT_KEY = $.qsuggest.ROOT_KEY = 'q-suggest';

	var gInd = 0;

	var defArgs = {
		ajax : {
			url : null ,
			cache : false,
			success : function(){}
		},
		reader : function( data ){ return data; },
		loader : function( val ){ return val; },
		max : 10,
		min : 1,
		container : null,
		delay : 100 ,	// Reaction time
		rdelay : 1000,	// Reaction time after request ( delay hiding when no response )
		requestWithNothing : false,
		trimQuery : true ,
		css : { 'z-index' : 500 },
		render : function( val ){ return String( val ).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") }
	};

	
	function _calc_pos( el ){
			var of = el.offset();
			of['top'] += el.outerHeight();
			return of;
	}	
	
	function _getData ( el ){
        var dataList = el.closest("table").data('data') , dataObj = dataList[ el.attr('data-ind') * 1 ];
		return  dataObj.val;
	}
	function QSuggest( el , args ){
		if( !this.init )
			return new qsuggest( el , args );
		else
			return this.init( el , args );
	}
	
	$.extend(QSuggest.prototype,{
		init : function ( aEl , args ){
			this.key = ++gInd;
			var ns = this.ns = ROOT_KEY + this.key;
			args = this.args = $.extend( true , {} , defArgs ,args || {} );
			var activeEl = this.activeEl = $(aEl);
			var self = this;
			
			this.el = $('<div class="' + ROOT_KEY + (args.customClass ? ' ' + args.customClass : '') + '"></div>').appendTo( args['container'] || document.body ).hide();
			this.el.data( ROOT_KEY , this );
			
			this._handler = null;
			this._ajaxHandler = null;
			this._excludeEl = null;
			this._mouseFocus = null;
			this._last = []; // [ cond , result ]
			this._cache = {};
			this._value = null;
			
			$.each( args['on'] || {} , function ( k , v ){
				activeEl.bind( k + '.' + ns  , v );
			});
			
			if( args['css'] )
				this.el.css( self.args['css'] );
				
			var self = this;
			
			detect_oninput.bind( activeEl[0] , function(){
                self._trigger('q-suggest-inputChange');
				self.show();
			});
			activeEl.bind('keyup.' + ns  , function( evt ){
				
				var visible = self.visible();
				var code = evt.keyCode;
				
				if( code === 40 && !visible ){
					self.show();
					return;
				}

                //如果没有显示
                if( !visible ) return;

				var elements = self.el.find( 'tr[data-sug_type="0"]' );
				var active = elements.filter('.active');

                switch (code) {
                    case 38 :  //	up
                    case 40 :  //	down
                        self._excludeEl = self._mouseFocus;
                        var index = elements.index(active);
                        index = evt.keyCode === 38 ? index - 1 : index + 1;

                        if (index >= elements.length) index = 0;
                        if (index < 0) index = elements.length - 1;

                        active.removeClass('active');
                        //取当前选择的
                        active = elements.eq(index);
                        var val = '';
                        if (active.length > 0) {
                            val = _getData(active);
                            self.setValue(val);
                            active.addClass('active');
                        }

                        evt.preventDefault();
                        self._trigger('q-suggest-user-action', [ evt.type , val , code ]);
                        break;
                    case 13 :  //	enter
                        //回车时设置值
                        if (active.length > 0) {
                            self.setValue(_getData(active));
                        }
                    case 27 :  //	esc
                        self.hide();
                        self._trigger('q-suggest-user-action', [ evt.type , self.getValue() , code ]);
                        break;
                    case 18 :    //	alt
                    case 9    :    //	tab
                        break;
                }
			});

			activeEl.bind('blur.' + ns , function( evt ){
				if( self.visible() ){
                    var active = self.el.find( 'tr.active' );
                    if(  active.length > 0 ){
                    	var v = _getData(active);
                        v && self.setValue(v);
                    }
                    self.hide();
                }

			});
			
			$('tr' , this.el[0]).live('mouseover.' + ns + ' mouseout.' + ns + ' mousedown.' + ns , function( evt ){
				var el = $.nodeName( evt.target , 'tr' ) ? $( evt.target ) : $( evt.target ).parents('tr').eq(0);

                //jquery
                if( $( el[0] ).attr('data-sug_type') == 1 ){
                    //如果当前项目不能选择取消默认行为
                    evt.preventDefault();
                    return;
                }

                var v = el[0]  != self._excludeEl;
				if( evt.type === 'mouseover' ){
                    //鼠标进入
					if( v ){
						el.parents().children().removeClass( 'active' );
						el.addClass( 'active' );
						self._excludeEl = null;
					}
					self._mouseFocus = el[0];
				}else if( evt.type === 'mouseout' ){
					self._mouseFocus = null;
				}else{
					self.setValue( _getData( el ) );
					self.hide();
					self._trigger('q-suggest-user-action' , [ evt.type , self.getValue() , null ] );
				}
			});

			return this;
		},
		req : function(){
			var self = this;
			if(self._handler)
				clearTimeout( self._handler );
			if(self._timeoutHandler){
				clearTimeout( self._timeoutHandler );
				self._timeoutHandler = null;
			}
			if(self._ajaxHandler){
                //for jquery1.5
				//self._ajaxHandler.abort();
				self._ajaxHandler = null;
			}
			self._handler = setTimeout( function(){
				
				var sv = self.activeEl.val() , val = self.args.loader( sv ) , data = null , status;
				
				if( self.args.trimQuery ) val = $.trim( val );
                val = val.replace(/[~!@#\$%\^&\*\(\)_\+<>\?:\\\\"\|\{\}`,\.\/;'\\\{\}]+/ig,"");

				if( !val && !self.args.requestWithNothing ){
					self.draw( null );
					return;
				}
				if( self._last && self._last[0] === val ){
					self.draw( self._last[1] );
					return;
				}
					
				if( self._last && self._last[0] == val )
					data = self._last;
				else if( self.args.cache && self._cache[ val ] )
					data = self._cache[ val ];
					
				if( data )
					self.draw( ( self._last = data )[1] );
				else if( !self.args.ajax.url )
					self.draw( null );
				else{
					var url = self.args.ajax.url.replace(/\*([^*]+)$/, encodeURIComponent( val ) + '$1');
					var _success = self.args.ajax.success;
					self._timeoutHandler = setTimeout( function(){ self.hide(); } , self.args.rdelay );
					self._ajaxHandler = $.ajax( $.extend( {} , self.args.ajax , { url : url , success : function( data , status ){
						clearTimeout( self._timeoutHandler );
						self._timeoutHandler = null;
						self._ajaxHandler = null;
						
						// double check if returns too late
						if( sv !== self.activeEl.val() )
							return;
                        //显示的列表   要填在input框中的列表

                        var dataList = self.args.reader.call( self ,  data , status );
                        if(self.type( dataList )==="Array"){
                            self.draw( dataList , data );
                            self._last = self._cache[ val ] = [ val , dataList , status ];
                        }

						_success.apply( this,arguments );
					}}));
					
				}
			} , self.args.delay );
		},
		type : function(data){
			return Object.prototype.toString.call(data).slice(8,-1);
		},
		show : function( ){
			this.req();
		},
		hide : function(){
			if( this.visible() ){
				this.el.hide();
				this._trigger( 'q-suggest-hide' );
			}
		},
		draw : function( dataList , result ){
			this.el.empty();
			
			var min = this.args.min , max = this.args.max;
			if( !dataList || !dataList.length || dataList.length < min ){
				this.hide();
				return;
			}
			
			var x = [] , r = this.args.render , isActive = true;
			x.push('<table cellspacing="0" cellpadding="2"><tbody>');
			$.each( dataList , function( ind , obj ){
				if( ind >= max ) return false;
                var str = '';
                if( obj.type !== 1 && isActive ){
                    isActive = false;
                    str = ' class="active" ';
                }
                x.push(['<tr', str ,' data-sug_type="',  obj.type , '" data-ind="', ind ,'"><td>' , r( obj.txt ) , '</td></tr>' ].join('') );

			});
			x.push('</tbody></table>');

            //add eventq-suggest-beforeshow for html
            this._trigger('q-suggest-beforeshow', [ this.el , result ]);
            
			var o = $( x.join('') ).appendTo( this.el ).data( 'data' , dataList );
			
			// calc position & width
			if( !this.args['container'] )
				this.el.css( _calc_pos( this.activeEl ) );

            //因为宽度要随着内容变化，只好设置宽度之后再取里面table的宽度
			var width = this.args['width'] , minWidth = this.activeEl.outerWidth() ;
            if( !width || width < minWidth ) width = minWidth;
            this.el.css( 'width' , width );

            this.el.show();

            width = Math.max( minWidth , $('table',this.el).width() + 2 );
            this.el.css( 'width' , width );


			this._trigger('q-suggest-show' , [ dataList ] );
		},
		dispose : function(){
			this._trigger('q-suggest-dispose');
			this.activeEl.unbind( '.' + this.ns );
			$( window ).unbind( '.' + this.ns )
			this.el.remove();
		},
		visible : function(){
			return this.el.is(":visible");
		},
		_trigger : function(){
			this.activeEl.triggerHandler.apply( this.activeEl , arguments );
		},
		setValue : function( val ){
            detect_oninput.set( this.activeEl[0] , val ); 
			//this.activeEl.val( val );
			this._value = val;
		},
		getValue : function(){
			return this._value;
		},
		set : function( key , value ){
			var handled = false;
			switch( key ){
				case 'container' :
					this.el.appendTo( value || document.body );
					this.el.css( { top : '' , left : '' } );
				break;
			}
			if( !handled )
				for( var i = 0 , w = key.split( '.' ) , len = w.length , z = this.args; i < len && ( i !== len - 1 && ( z[ w[i] ] || ( z[ w[i] ] = {} ) ) || ( z[ w[i] ] =  value ) ); z = z[ w[i] ] , i++ ){}
			return value;	
		},
		get : function( key ){
			for( var i = 0 , z = this.args , w = key.split(".") , len = w.length ; i < len && ( z = z[ w[i] ] ); i++ ){}
			return z;
		}
	});
	
	$.fn.qsuggest = function( ){
		var args = arguments;
		
		if( arguments.length > 1 && this.data( ROOT_KEY )){
			var val = null;
			if( arguments[0] === 'option' || arguments[0] === 'setting' )
				this.each( function( ind , el ){
					var jEl = $( el );
					var sug = this.data( ROOT_KEY );
					if( sug )
						val = val || ( args.length > 2 ? sug.set(args[1] , args[2]) : sug.get(args[1]) );
				});
			return val;
		//init a suggest
		}else if( arguments.length <= 1) {
			
			this.each( function( ind , el ){
				var jEl = $( el );
				if( jEl.data( ROOT_KEY ) ){
					jEl.data( ROOT_KEY ).dispose();
					jEl.removeData(ROOT_KEY);
				}
				var sug = new QSuggest( el , args[0] );
				jEl.data( ROOT_KEY , sug );
			});
			
		}
		return this;
	}
})(jQuery);
