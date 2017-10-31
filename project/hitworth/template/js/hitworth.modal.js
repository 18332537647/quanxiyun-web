;
(function($, window, document, undefined) {
	var HwModal = function(element, options) {
		this.$element = $(element);
		this._element = element;
		// title的jquery元素
		this.$title = new Object();
		// modal的jquery元素
		this.$modal = new Object();
		// modal的body的jquery元素
		this.$body = new Object();
		// 当前属性
		this._options = options;
		// 初始化属性
		SetAttribute(options, this);

		this._init();
	};
	var SetAttribute = function(options, that) {
		//modal的id
		that._modal_id = options.id;
		//modal的标题
		that._title = options.title;
		//modal的宽度
		that._width = options.width;
		
		if(options.zIndex!=undefined){
			//确认按钮的事件
			that._zIndex = options.zIndex;
		}
		//是否显示确认按钮
		that._showOkButton = options.showOkButton;
		//确认按钮的文本
		that._okButtonText = options.okButtonText;
		if(options.okHandle!=undefined){
			//确认按钮的事件
			that._okHandle = options.okHandle;
		}
		//内容
		that._content = options.content;
	};
	HwModal.defaults = {
		width : "800px;",
		showOkButton : false,
		okButtonText : "确认",
		content : ''
	};
	HwModal.prototype = {
		//显示modal
		show : function() {
			this.$modal.modal("show");
		},
		//隐藏modal
		hide : function(cb) {
			this.$modal.modal("hide");
			if(typeof(cb) =="function"){
				cb();//执行隐藏后回调函数
			}
		},
		//设置modal标题
		setTitle : function(title) {
			this.$title.html(title);
		},
		
		//设置modal标题
		setZindex : function(zIndex) {
			$("#"+this._modal_id).css("z-index",zIndex);
		},
		//初始化modal
		_init : function() {
			this._render();
		},
		//清除modal
		_remove : function() {
			this.$modal.remove();
		},
		//渲染modal
		_render : function() {
			var that = this;
			var modal = $('<div class="modal fade" id="' + this._modal_id
					+ '" tabindex="-1" role="dialog"' + 'aria-labelledby="'
					+ this._modal_id + 'Label" aria-hidden="true" style="'+ (this._zIndex==undefined?"":"z-index:"+this._zIndex+";")+'"><div>');
			var dialog = $('<div class="modal-dialog" style="width: '
					+ this._width +';'+  '"></div>');
			var content = $('<div class="modal-content"></div>');
			var header = $('<div class="modal-header"></div>');
			var close = $('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
			var title = $('<h4 class="modal-title" id="myModalLabel">'
					+ this._title + '</h4>');
			this.$title = title;
			header.append(close);
			header.append(title);
			var bodys = $('<div id="' + this._modal_id+'_body" class="modal-body" >'+this._content+'</div>');
			this.$body = bodys;
			var footer = $('<div class="modal-footer"></div>');
			if (this._showOkButton) {
				var okButton = $('<button type="button" class="btn">'
						+ this._okButtonText + '</button>');
				footer.append(okButton);
				okButton.click(function() {
					that.hide(that._okHandle);
				});
			}
			content.append(header);
			content.append(bodys);
			content.append(footer);
			dialog.append(content);
			modal.append(dialog);
			this.$modal = modal;
			this.$element.append(modal);
		}
	};
	var modal = function(options) {
		options = $.extend({}, HwModal.defaults, options);
		var eles = [];
		this.each(function() {
			var self = this;
			var modal = new HwModal(self, options);
			eles.push(modal);
		});
		return eles[0];
	};

	$.fn.extend({
		'HwModal' : modal
	});
})(jQuery, window, document);