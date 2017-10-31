;(function ( $, window, document, undefined ){
	var HwSearch = function(element,options){
		this.$element = $(element);
		this._element = element;
		this._elementId = this._element.id;
		this.$searchForm = new Object();
		this._items = options.items;
		this._init();
	};
	HwSearch.defaults = {
		title : "标题",
		targetEle : "",
		items : [{
			type : "text",
			label : "普通文本",
			name : "name"
		}]
	};
	HwSearch.prototype = {
		_init : function(){
			this._render();
		},
		_render : function(){
			var that = this;
			var row = $('<div class="row"></div>');
			var col = $('<div class="col-sm-12 m-b-xs"></div>');
			var searchForm = $('<form id="'+that._elementId+'_search_form" class="form-inline"></div>');
			this.$searchForm = searchForm;
			col.append(searchForm);
			row.append(col);
			$.each(this._items,function(index,content){
				that._initItems(content);
			});
			var searchBtn = $('<button type="button" class="btn btn-primary" style="margin-top: 3px;">搜索</button>');
			searchForm.append(searchBtn);
			this.$element.append(row);
		},
		_initItems : function(content){
			if(content.type=='text'){
				this.$searchForm.append(this._getText(content));
			}
		},
		_getText : function(content){
			var str= '<div class="form-group">';
			str+='<label class="class="sr-only">'+content.label+'</label>';
			str+='<input type="text" name="'+content.name+'" class="form-control">';
			str+='</div>';			
			return str;
		}
	};
	var fun = function(options){
		options = $.extend({}, HwSearch.defaults, options);
		var eles = [];
		this.each(function() {
			var self = this;
			var search = new HwSearch(self,options);
			eles.push(search);
		});
		return eles[0];	
	};

	$.fn.extend({
		'HwSearch':fun
	});
})(jQuery, window,document);