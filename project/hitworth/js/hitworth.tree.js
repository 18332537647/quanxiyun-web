;(function ( $, window, document, undefined ){
	var HwTree = function(element,options){
		this.$element = $(element);
		this._element = element;
		this._elementId = this._element.id;
		//当前options
		this._options = options;
		//初始属性
		SetAtrribute(this._options,this);
		//当前树
		this._tree = new Object();
		//是否已经初始化
		this.inited = false;
		this._init();
	};
	//初始化化属性
	var SetAtrribute = function(options,that){
		//树id
		that._treeId = options.treeId;
		//树异步加载url
		that._url = options.url;
		//ztree设置
		that._setting = options.setting;
	};
	HwTree.defaults = {
		treeId : "",
		url : "",
		setting : {
			check : {
				enable : true
			},
			data : {
				simpleData : {
					enable : true
				}
			}
		}
	};
	HwTree.prototype = {
		//重新加载树
		reload : function(options){
			this.$element.html('');
			if(options!=undefined){
				this._options = $.extend({}, this._options, options);
			}
			this._init();
		},
		//初始化
		_init : function(){
			this._render();
			this._loadUrl();
		},
		//渲染ul
		_render : function(){
			if(this.inited){
				return;
			}
			var tree = $('<ul id="'+this._treeId+'" class="ztree"></ul>');
			this.$element.append(tree);
			this._tree = tree;
		},
		//异步加载树
		_loadUrl : function(){
			var that = this;
				$.post(this._url, {}, function(res) {
					var data;
					if (typeof res=="object"){
						data=res;
					}else{
						var json = eval("("+res+")");
						data = json;	
					}
					that.zNodes = data;
					$.fn.zTree.init(that._tree, that._setting, that.zNodes);
				});	
		}
	};
	var tree = function(options){
		options = $.extend({}, HwTree.defaults, options);
		var eles = [];
		this.each(function() {
			var self = this;
			var tree = new HwTree(self,options);
			eles.push(tree);
		});
		return eles[0];	
	};

	$.fn.extend({
		'HwTree':tree
	});
	
	var HwSlideTree = function(element, options) {
		this.$element = $(element);
		this._element = element;
		this._elementId = this._element.id;
		this.inited = false;
		this._treeId = options.treeId;
		this._url = options.url;
		this._tree = new Object();
		this.$menu = new Object();
		this._menuId = "";
		this._setting = options.setting;
		this._init();
	};
	HwSlideTree.defaults = {
		treeId : "",
		url : "",
		setting : {
			check : {
				enable : true
			},
			data : {
				simpleData : {
					enable : true
				}
			}
		},
		callback : {
			onClick : this._onClick
		}
	};
	HwSlideTree.prototype = {
		_init : function() {
			this._render();
			this._loadUrl();
		},
		_refresh : function(){
			var treeObj = $.fn.zTree.getZTreeObj(this._treeId);
			treeObj.reAsyncChildNodes(null, "refresh");
		},
		_render : function() {
			if (this.inited) {
				return;
			}
			var span = $('<span></span>');
			var menu = $('<div id="'
					+ this._elementId
					+ '_menu" class="treeMenu">');
			var tree = $('<ul id="' + this._treeId + '" class="ztree"></ul>');
			this._menuId = this._elementId + '_menu';
			//menu.css("width",this.$element.css("width"));
			menu.append(tree);
			span.append(menu);
			this.$element.closest(".form-inline").append(span);
			this.$menu = menu;
			this._tree = tree;
		},
		_loadUrl : function() {
			var that = this;
			if(that._url!=''){
				if(typeof(this._url) =="object"){
					that._renderNode(that._url);
				}else{
					$.post(that._url, {}, function(res) {
						that._renderNode(res);
					});
				}
			}
			
		},
		_renderNode:function(res){
			var that = this;
			var data;
			if (typeof res == "object") {
				data = res;
			} else {
				var json = eval("(" + res + ")");
				data = json;
			}
			that.zNodes = data;
			$.fn.zTree.init(that._tree, that._setting, that.zNodes);
			var zTree = $.fn.zTree.getZTreeObj(that._treeId);
			zTree.setting.callback.onCheck = function(e, treeId, treeNode) {
				nodes = zTree.getCheckedNodes(true);
				var text = "";
				nodes.sort(function compare(a, b) {
					return a.id - b.id;
				});
				for (var i = 0, l = nodes.length; i < l; i++) {
					text += nodes[i].name + ",";
				}
				if (text.length > 0)
					text = text.substring(0, text.length - 1);
				that.$element.val(text);

				var v = "";
				for (var i = 0, l = nodes.length; i < l; i++) {
					v += nodes[i].id + ",";
				}
				if (v.length > 0)
					v = v.substring(0, v.length - 1);
					that.$element.next("input[type='hidden']").val(v);
			};
		},
		_toggle : function(){
			if(this.$menu.is(":visible")){
				this._hideMenu();
			}else{
				this._showMenu();
			}
		},
		_showMenu : function() {
			var that = this;
			//var inputObject = this.$element;
			//var cityOffset = this.$element.offset();
			this.$menu.slideDown("fast");
			
		},
		_hideMenu : function() {
			var that = this;
			this.$menu.fadeOut("fast");
		}
	};
	var slideTree = function(options) {
		options = $.extend({}, HwSlideTree.defaults, options);
		var eles = [];
		this.each(function() {
			var self = this;
			var tree = new HwSlideTree(self, options);
			eles.push(tree);
		});
		return eles[0];
	};
	
	var setTreeUrl = function(url) {
		this.each(function() {
			var self = this;
			var treeObj = $.fn.zTree.getZTreeObj(self.id);
			treeObj.setting.async.url=url;
			treeObj.reAsyncChildNodes(null, "refresh");
		});
	};

	$.fn.extend({
		'HwSlideTree' : slideTree
	});
	
	$.fn.extend({
		'HwSetTreeUrl' : setTreeUrl
	});
})(jQuery, window,document);