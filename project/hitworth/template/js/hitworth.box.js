;(function ( $, window, document, undefined ){
	var HwBox = function(element,options){
		this.$element = $(element);
		this._element = element;
		this._elementId = this._element.id;
		this._title = options.title;
		this._collapse = options.collapse;
		this._close = options.close;
		this.inited = false;
		this.$content = new Object();
		this._init();
	};
	HwBox.defaults = {
		title : "标题",	
		collapse : true,
		close : true
	};
	HwBox.prototype = {
		_init : function(){
			this._render();
		},
		_render : function(){
			if(this.inited){
				return;
			}
			console.log(this._title)
			this.$element.addClass("ibox");
			var title = $('<div class="ibox-title"></div>')
			var h5 = $('<h5>'+this._title+'</h5>');
			var tools = $('<div class="ibox-tools"></div>');
			if(this._collapse){
				tools.append('<a class="collapse-link"><i class="fa fa-chevron-up"></i></a>');
			}
			if(this._close){
				tools.append(' <a class="close-link"><i class="fa fa-times"></i></a>');
			}
			title.append(h5);
			title.append(tools);			
			var content = $('<div id="'+this._elementId+'_content" class="ibox-content"></div>');
			this.$element.append(title);
			this.$element.append(content);
			this.$content = content;
			this.inited = true;
		}
	};
	var fun = function(options){
		options = $.extend({}, HwBox.defaults, options);
		var eles = [];
		this.each(function() {
			var self = this;
			var box = new HwBox(self,options);
			eles.push(box);
		});
		return eles[0];	
	};

	$.fn.extend({
		'HwBox':fun
	});
})(jQuery, window,document);