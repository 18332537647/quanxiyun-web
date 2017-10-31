;
(function ($, window, document, undefined) {
	var HwForm = function (element, options) {
		this.$element = $(element);
		this._element = element;
		this._elementId = this._element.id;
		// 表单juqery元素变量
		this.$form = new Object();
		this._options = options;
		SetAttribute(this._options, this);
		if (this._form_id == undefined) {
			return false;
		}
		this._init();
	};
	// 设置属性
	var SetAttribute = function (options, that) {
		// 表单id
		that._form_id = options.id;
		// 表单名称
		that._form_name = options.name;
		// 表单提交方式
		that._form_method = options.method;
		// 表单提交action
		that._form_action = options.action;
		// 是否ajax提交
		that._form_ajaxSubmit = options.ajaxSubmit;
		// 是否显示重置
		that._form_showSubmit = options.showSubmit;
		// 提交按钮文本
		that._form_submitText = options.submitText;
		// 是否显示重置
		that._form_showReset = options.showReset;
		// 重置按钮文本
		that._form_resetText = options.resetText;
		// 表单元素
		that._items = options.items;
		// 表单按钮
		that._buttons = options.buttons;
		// 是否开启表单验证
		that._isValidate = options.isValidate;
		// 默认label宽度
		that._labelSpan = options.labelSpan;
		// 显示分割线
		that._showLine = options.showLine;
		// ajax提交成功回调函数
		if (options.ajaxSuccess != undefined) {
			that._form_ajaxSuccess = options.ajaxSuccess;
		}
		// 提交前执行函数
		if (options.beforeSubmit != undefined) {
			that._beforeSubmit = options.beforeSubmit;
		}
	};

	HwForm.defaults = {
		method : "post",
		ajaxSubmit : false,
		showSubmit : true,
		submitText : "保存",
		showReset : true,
		resetText : "重置",
		isValidate : true,
		labelSpan : "2",
		showLine : true
	};

	HwForm.prototype = {
		// 加载本地data
		loadValue : function (name, value) {
			var that = this;
			var ele = $("#" + that._form_id).find("[name='" + name + "']");
			if (ele.is('input[type="text"]')) {
				ele.val(value);
			} else if (ele.is('input[type="radio"]')) {
				for (var i in ele) {
					if (ele[i].value == value) {
						ele[i].checked = true;
					}
				}
			} else if (ele.is('input[type="checkbox"]')) {
				var values = value.split(",");
				for (var i in ele) {
					if (values.indexOf(ele[i].value) != -1) {
						ele[i].checked = true;
					}
				}
			} else if (ele.is('input[type="hidden"]')) {
				if (ele.attr("data-hidden") == "true") {
					ele.val(value);
					var tree = $.fn.zTree.getZTreeObj(ele.attr("data-tree-id"));
					if (tree != undefined) {
						tree.reAsyncChildNodes(-1, "refresh");
					}
				} else {
					ele.val(value);
				}
			}
			if (ele.is('select')) {
				ele.val(value);
			}
			if (ele.is('textarea')) {
				ele.html(value);
			}
			if (ele.is('p')) {
				if (ele.attr("data-type") == "image") {
					var img = $('<img alt="图片">');
					img.attr("src", value);
					img.attr("width", ele.attr("width"));
					img.attr("height", ele.attr("height"));
					ele.html(img);
				} else {
					ele.text(value);
				}

			}
		},
		// 加载本地data
		loadLocal : function (param) {
			var that = this;
			that.reset();
			var form_data;
			if (typeof param == "object") {
				form_data = param;
			} else {
				var json = eval("(" + param + ")");
				form_data = json;
			}
			for (var name in form_data) {
				that.loadValue(name, form_data[name]);
			}
		},
		// 异步加载表单
		loadRemote : function (url) {
			var that = this;
			that.reset();
			$.post(url, {}, function (res) {
				var form_data;
				if (typeof res == "object") {
					form_data = res;
				} else {
					var json = eval("(" + res + ")");
					form_data = json;
				}
				for (var name in form_data) {
					that.loadValue(name, form_data[name]);
				}
			});
		},
		// form重载
		reload : function (options) {
			this._options = $.extend({}, this._options, options);
			SetAttribute(this._options, this);
			this._remove();
			this._init();
		},
		// 设置action
		setAction : function (action) {
			this._form_action = action;
		},
		// 重置表单
		reset : function () {
			$("#" + this._form_id)[0].reset();
			$("#" + this._form_id).find("input[type='hidden']").val("");
			$("#" + this._form_id).find("textarea").html("");
			this.clearValidate();
		},
		// 表单内显示提示信息
		alertText : function (type, msg, time) {
			this._alert(type, msg, time);
		},
		// 清空表单内提示信息
		cleanAlertText : function () {
			$(".alert").remove();
		},
		// 刷新元素支持select，radiogroup，checkboxgroup
		refreshItem : function (id, url) {
			var that = this;
			var eles = this.$form.find("#" + id);
			var ele;
			if (eles.length > 0) {
				ele = $(eles[0]);
				if (ele.is("select")) {
					ele.empty();
					$.each(that._items, function (index, content) {
						if (content.id == id) {
							$.post(url, {}, function (res) {
								var urlItems;
								if (typeof res == "object") {
									urlItems = res;
								} else {
									var json = eval("(" + res + ")");
									urlItems = json;
								}
								var value = content.value;
								var urlOptions = that._getOptions(urlItems,value);
								ele.append(urlOptions);
							});
						}
					});

				} else if (ele.is("div") && ele.attr("data-type") == "radio") {
					ele.html("");
					$.each(that._items, function (index, content) {
						if (content.id == id) {
							$.post(url, {}, function (res) {
								var urlItems;
								if (typeof res == "object") {
									urlItems = res;
								} else {
									var json = eval("(" + res + ")");
									urlItems = json;
								}
								var validate = '';
								if (that._isValidate) {
									if (content.rule != undefined) {
										var rule = content.rule;
										for (var key in rule) {
											validate += 'data-rule-' + key + '="' + rule[key] + '" ';
										}
									}

									if (content.msg != undefined) {
										var msg = content.msg;
										for (var key in msg) {
											validate += 'data-msg-' + key+ '="' + msg[key] + '" ';
										}
									}
								}
								var urlRadios = that._getAjaxRadios(urlItems,validate);
								urlRadios += '<label for="' + urlItems[0].name+ '" class="error"></label>';
								ele.append(urlRadios);
							});

						}
					});

				} else if (ele.is("div") && ele.attr("data-type") == "checkbox") {
					ele.html("");
					$.each(that._items, function (index, content) {
						if (content.id == id) {
							$.post(url, {}, function (res) {
								var urlItems;
								if (typeof res == "object") {
									urlItems = res;
								} else {
									var json = eval("(" + res + ")");
									urlItems = json;
								}
								var validate = '';
								if (that._isValidate) {
									if (content.rule != undefined) {
										var rule = content.rule;
										for (var key in rule) {
											validate += 'data-rule-' + key + '="' + rule[key] + '" ';
										}
									}

									if (content.msg != undefined) {
										var msg = content.msg;
										for (var key in msg) {
											validate += 'data-msg-' + key + '="' + msg[key] + '" ';
										}
									}
								}
								var urlCheckboxs = that._getAjaxCheckboxs(urlItems, validate);
								urlCheckboxs += '<label for="'+ urlItems[0].name+ '" class="error"></label>';
								ele.append(urlCheckboxs);
							});
						}
					});

				}
			}
		},
		// 清空验证
		clearValidate : function () {
			if (this._validate != undefined) {
				this._validate.resetForm();
			}
		},
		// 初始化
		_init : function () {
			this._initFormInfo();
			this._initItems();
			this._initButtons();
			if (this._isValidate) {
				this._validate();
			}
		},
		// 表单验证成功后执行函数
		_validate : function () {
			var that = this;
			this._validate = this.$form.validate({
					submitHandler : function (form) {
						// 校验tree
						var treeValideFlag = true;
						var treeInputs = $('[data-hidden="true"]');
						for (var i = 0; i < treeInputs.length; i++) {
							var ele = $(treeInputs[i]);
							if (ele.attr("data-rule-required") == "true") {
								if (ele.val() == "") {
									$("#" + ele.attr("data-tree-id") + "-error").html(ele.attr("data-msg-required")).show();
									treeValideFlag = false;
									return false;
								}
							}
						}
						// 若是ajax提交
						if (treeValideFlag && that._form_ajaxSubmit) {
							$.ajax({
								type : that._form_method,
								url : that._form_action,
								data : $('#' + that._form_id).serialize(),
								dataType : "json",
								success : that._form_ajaxSuccess,
								error : function (data) {
									alert("异步提交表单错误.");
								}
							});
							// 普通表单提交
						} else {
							form.submit();
						}

					}
				});
		},
		// 初始化表单
		_initFormInfo : function () {
			var form = $('<form id="' + this._form_id + '" name="'
					 + this._form_name + '" method = "' + this._form_method
					 + '" action="' + this._form_action
					 + '" class="form-horizontal" enctype="multipart/form-data"></form>');
			$('#' + this._elementId).append(form);
			this.$form = form;
		},
		// 提示
		_alert : function (type, msg, time) {
			var alert_div = $('<div class="alert alert-'
					 + type
					 + ' alert-dismissable">'
					 + '<button aria-hidden="true" data-dismiss="alert" class="close" type="button">×</button>'
					 + msg + '</div>');
			this.$form.prepend(alert_div);
			this._scrollTo(alert_div, -200);
			var remove = function () {
				alert_div.remove();
			}
			if (time != undefined)
				setTimeout(remove, time);
		},
		_scrollTo : function (el, offeset) {
			var pos = el ? el.offset().top : 0;
			$('html,body').animate({
				scrollTop : pos + (offeset ? offeset : 0)
			}, 'slow');
		},
		// 初始化元素
		_initItems : function () {
			var that = this;
			$.each(that._items,function (index, content) {
				if (content.type == 'text') {
					$('#' + that._form_id).append(
						that._getText(content));
				}
				if (content.type == 'textGroup') {
					$('#' + that._form_id).append(
						that._getTextGroup(content));
				}
				if (content.type == 'hidden') {
					$('#' + that._form_id).append(
						that._getHidden(content));
				}
				if (content.type == 'password') {
					$('#' + that._form_id).append(
						that._getPassword(content));
				}
				if (content.type == 'textarea') {
					$('#' + that._form_id).append(
						that._getTextarea(content));
				}
				if (content.type == 'display') {
					$('#' + that._form_id).append(
						that._getDisplay(content));
				}
				if (content.type == 'checkboxGroup') {
					$('#' + that._form_id).append(
						that._getCheckboxGroup(content));
				}
				if (content.type == 'radioGroup') {
					$('#' + that._form_id).append(
						that._getRadioGroup(content));
				}
				if (content.type == 'select') {
					$('#' + that._form_id).append(
						that._getSelect(content));
				}
				if (content.type == 'datepicker') {
					$('#' + that._form_id).append(
						that._getDatepicker(content));
				}
				if (content.type == 'file') {
					$('#' + that._form_id).append(
						that._getFile(content));
					if (content.uploadUrl != undefined) {
						var uploadUrl = content.uploadUrl;
						$('#' + content.id + '_button').click(function () {
							if ($("#"+ content.id).val() == "") {
								$("#"+ content.id+ "_error").html("请选择文件");
								return;
							}
							$.ajaxFileUpload({
								url : uploadUrl,
								secureuri : false,
								fileElementId : content.id,
								dataType : 'json',
								success : function (data,status) {
									var _data;
									if (typeof data == "object") {
										_data = data;
									} else {
										var json = eval("("+ data+ ")");
										_data = json;
									}
									content.onSuccess(_data);
								},
								error : function (data,status,e) {
									alert(e);
								}
							});
						});
					}

				}
				if (content.type == 'tree') {
					$('#' + that._form_id).append(that._getTree(content));
					var checkMode = "checkbox";
					if (content.checkMode != undefined) {
						checkMode = content.checkMode;
					}
					var onSuccess = function (event, treeId,treeNode, msg) {
						var values = $("input[type='hidden'][data-tree-id='"+ treeId + "']").val();
						var zTree = $.fn.zTree.getZTreeObj(treeId);
						var ids = values.split(",");
						var names = [];
						if (ids != "") {
							for (i in ids) {
								var c_node = zTree.getNodeByParam("id",ids[i], null);
								zTree.checkNode(c_node, true,true);
								names.push(c_node.name);
							}
							$("[data-text-id='" + treeId + "']").val(names);
						} else {
							zTree.checkAllNodes(false);
						}
					};
					var tree = $("#" + content.id).HwSlideTree({
							treeId : content.treeId,
							url : content.url,
							setting : {
								async : {
									enable : true,
									url : content.url
								},
								check : {
									enable : true,
									chkStyle : checkMode,
									radioType : "all"
								},
								data : {
									simpleData : {
										enable : true
									}
								},
								callback : {
									onAsyncSuccess : onSuccess
								}
							}
						});
					$('#' + content.id + '_button').click(function () {
						//tree._refresh();
						tree._toggle();
					});
				}
			});
		},
		// 初始按钮
		_initButtons : function () {
			var that = this;
			var str = '<div class="form-group"><div id="'+ that._form_id+ '_action" class="col-sm-12 center"></div></div>';
			$('#' + that._form_id).append(str);
			if (this._form_showSubmit) {
				that._initSubmit();
			}
			if (this._form_showReset) {
				that._initReset();
			}
			if (that._buttons != undefined) {
				$.each(that._buttons, function (index, content) {
					if (content.type == 'button') {
						that._initButton(that._form_id, content);
					}
				});
			}
		},
		// 初始提交按钮
		_initSubmit : function () {
			var that = this;
			var fun = function () {};
			if (that._beforeSubmit != undefined) {
				fun = that._beforeSubmit;
			}
			var button;
			if (this._isValidate) {
				button = $('<button type="submit" class="btn btn-primary">'
						 + this._form_submitText + '</button>');
				$('#' + this._form_id + '_action').append(button);
				button.click(function () {
					fun();
				});
			} else {
				if (this._form_ajaxSubmit) {
					button = $('<button type="button" class="btn btn-primary">'
							 + this._form_submitText + '</button>');
				} else {
					button = $('<button type="submit" class="btn btn-primary">'
							 + this._form_submitText + '</button>');
				}
				$('#' + this._form_id + '_action').append(button);
				if (this._form_ajaxSubmit) {
					button.click(function () {
						fun();
						$.ajax({
							type : that._form_method,
							url : that._form_action,
							data : $('#' + that._form_id).serialize(),
							dataType : "json",
							success : that._form_ajaxSuccess,
							error : function (data) {
								alert("异步提交表单错误.");
							}
						});
					});
				} else {
					button.click(function () {
						fun();
					});
				}
			}

		},
		// 初始重置按钮
		_initReset : function () {
			var that = this;
			var button = $('<button type="reset" class="btn btn-white">'
					 + this._form_resetText + '</button>');
			$('#' + this._form_id + '_action').append(button);
			
			button.on("click",function(){
				that.reset();
			});
		},
		// 初始按钮
		_initButton : function (form_id, data) {
			var button = $('<button type="button" class="btn btn-white">'+ data.text + '</button>');
			$('#' + form_id + '_action').append(button);
			if (typeof(data.handle) != "undefined") {
				var func = data.handle;
				button.click(func);
			}
		},
		// text类型渲染
		_getText : function (element_data) {
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '6';
			if (typeof(element_data.span) != "undefined") {
				span = element_data.span;
			}
			var value = '';
			if (typeof(element_data.value) != "undefined") {
				value = element_data.value;
			}
			str += '<div class="col-sm-' + span + '">';
			var validate = '';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key]
						 + '" ';
					}
				}
				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}
			var readonly=''
			if(element_data.isReadOnly !=undefined && element_data.isReadOnly){
				readonly="readonly=readonly"
			}
			str += '<input '+readonly+' type="text" name="' + element_data.name
			 + '" value="' + value + '" id="' + element_data.id + '" '
			 + validate + ' class="form-control">';
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			str += '</div>';
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}
			return str;
		},
		//文本框组渲染
		_getTextGroup:function(element_data){
			var items='<div class="form-group" id="'+element_data.id+'">';
			var width='';
			var validate = '';
			items += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label><div class="col-sm-6">';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key]
						 + '" ';
					}
				}
				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}
			if(element_data.textItem !=undefined){
				var itemSize=element_data.textItem;
				width=100/itemSize.length;
				for(var i=0;i<itemSize.length;i++){
					items+='<div style="width:'+width+'%; text-align:center; float:left"><label>'+itemSize[i].label+'</label><input class="form-control"  '+validate+' name="'+itemSize[i].name+'" type="text"/></div>';
				}
			}
			items+='</div>';
			if (element_data.detail != undefined) {
				items += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			items+='</div>';
			if (this._showLine) {
				items += '<div class="hr-line-dashed"></div>';
			}
			console.log(items);
			return items;
		},
		// hidden类型渲染
		_getHidden : function (element_data) {
			var value = '';
			if (element_data.value != undefined) {
				value = element_data.value;
			}
			var str = '<input type="hidden" name="' + element_data.name
				 + '" id="' + element_data.id + '"  value="' + value + '">';
			return str;
		},
		// password类型渲染
		_getPassword : function (element_data) {
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '6';
			if (element_data.span != undefined) {
				span = element_data.span;
			}
			var value = '';
			if (element_data.value != undefined) {
				value = element_data.value;
			}
			str += '<div class="col-sm-' + span + '">';
			var validate = '';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key]
						 + '" ';
					}
				}

				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}
			str += '<input type="password" name="' + element_data.name
			 + '" id="' + element_data.id + '" ' + validate
			 + ' class="form-control" value="' + value + '">';
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			str += '</div>'
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}
			return str;
		},
		// textarea类型渲染
		_getTextarea : function (element_data) {
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '6';
			if (element_data.span != undefined) {
				span = element_data.span;
			}
			var value = '';
			if (element_data.value != undefined) {
				value = element_data.value;
			}
			str += '<div class="col-sm-' + span + '">';
			var validate = '';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key]+ '" ';
					}
				}

				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}
			str += '<textarea class="form-control" name="' + element_data.name
			 + '" id="' + element_data.id + '" ' + validate + ' >'
			 + value + '</textarea>';
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			str += '</div>'
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}
			return str;
		},
		// 日期控件渲染
		_getDatepicker : function (element_data) {
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '6';
			if (element_data.span != undefined) {
				span = element_data.span;
			}
			var value = '';
			if (element_data.value != undefined) {
				value = element_data.value;
			}
			str += '<div class="col-sm-' + span + '">';
			var istime = false;
			if (element_data.isTime != undefined) {
				istime = element_data.isTime;
			}
			var format = "YYYY-MM-DD hh:mm:ss";
			if (element_data.format != undefined) {
				format = element_data.format;
			}
			var validate = '';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key]
						 + '" ';
					}
				}

				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}
			var min = "";
			if (element_data.min != undefined) {
				min = "min : '" + element_data.min + "', ";
			}
			var max = "";
			if (element_data.max != undefined) {
				max = "max : '" + element_data.max + "', ";
			}
			str += '<input type="text" class="form-control layer-date" name="'
			 + element_data.name + '" id="' + element_data.id
			 + '" onclick="laydate({istime: ' + istime + ' ,' + min + max + ' format:\''
			 + format + '\'})" ' + validate + '>';
			str += '<label onclick="laydate({istime :' + istime + ',' + min + max + ' format:\''
			 + format + '\', elem: \'#' + element_data.id
			 + '\'});" class="laydate-icon inline demoicon"></label>';
			str += '<br><label for="' + element_data.name
			 + '" class="error"></label>';
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			str += '</div>'
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}
			return str;
		},
		// 文件控件渲染
		_getFile : function (element_data) {
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '6';
			if (element_data.span != undefined) {
				span = element_data.span;
			}
			var value = '';
			if (element_data.value != undefined) {
				value = element_data.value;
			}
			str += '<div class="form-inline col-sm-' + span + '">';
			var validate = '';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key]
						 + '" ';
					}
				}

				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}
			str += '<span><input type="file" class="form-control" name="'
			 + element_data.name + '" id="' + element_data.id + '" '
			 + validate + '>';

			str += '<input type="hidden" value="'+(element_data.hiddenVal == undefined?'':element_data.hiddenVal)+'" name="' + element_data.hiddenName
			 + '" id="' + element_data.hiddenId;
			if (element_data.isAjaxUpload == undefined
				 || (!element_data.isAjaxUpload)) {
				str += validate;
			}
			str += '">';
			if (element_data.isAjaxUpload != undefined
				 && element_data.isAjaxUpload) {
				str += '<button type="button" id="'
				 + element_data.id
				 + '_button"  class="btn btn-primary">'
				 + '上传</button></span>';
			}
			str += '<label id="' + element_data.id + '_error" for="'
			 + element_data.id + '" class="error"></label>';
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			str += '</div>'
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}
			return str;
		},
		// 树形控件渲染
		_getTree : function (element_data) {
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '8';
			if (element_data.span != undefined) {
				span = element_data.span;
			}
			var value = '';
			if (element_data.value != undefined) {
				value = element_data.value;
			}
			str += '<div class="form-inline col-sm-' + span + '">';
			var validate = '';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key] + '" ';
					}
				}

				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}
			str += '<input data-text-id=' + element_data.treeId
			 + ' type="text"  name="'
			 + element_data.name + '" id="' + element_data.id
			 + '" class="form-control" ' + validate + '>';
			str += '<input data-hidden="true" data-tree-id="'
			 + element_data.treeId + '" type="hidden" name="'
			 + element_data.hiddenName + '" id="'
			 + element_data.hiddenId + '" >';
			str += '<button id="' + element_data.id
			 + '_button" type="button" class="btn btn-primary">'
			 + '显示/隐藏</button>';
			 if (this._isValidate) {
				str += '<label id="' + element_data.treeId
				 + '-error" class="error" for="' + element_data.name
				 + '"></label>';
			}
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			str += '</div>'
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}

			return str;
		},
		// 展示域渲染
		_getDisplay : function (element_data) {
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '8';
			if (element_data.span != undefined) {
				span = element_data.span;
			}
			var value = '';
			if (element_data.value != undefined) {
				value = element_data.value;
			}
			var dataType = ' data-type="text"';
			if (element_data.dataType != undefined) {
				dataType = ' data-type="' + element_data.dataType + '"';
			}
			var width = '';
			if (element_data.width != undefined) {
				width = ' width="' + element_data.width + '"';
			}
			var height = '';
			if (element_data.height != undefined) {
				height = ' height="' + element_data.height + '"';
			}
			str += '<div class="col-sm-' + span + '">';
			str += '<p name="' + element_data.name + '" id="' + element_data.id
			 + '" ' + dataType + width + height
			 + ' class="form-control-static">' + value + '</p>';
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			str += '</div>';
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}
			return str;
		},
		// checkbox渲染
		_getCheckboxs : function (items, validate) {
			var str = '';
			var name = '';
			$.each(items, function (index, content) {
				var checked = "";
				if (content.checked != undefined) {
					if (content.checked) {
						checked = 'checked="checked"';
					}
				}
				str += '<div class="checkbox"><label>';
				str += '<input type="checkbox" name="' + content.name
				 + '" value="' + content.value + '" ' + validate + ' '
				 + checked + '>' + content.text + '</label></div>';
				name = content.name;
			});
			str += '<label for="' + name + '" class="error"></label>';
			return str;
		},
		// ajax异步加载checkbox
		_getAjaxCheckboxs : function (items, validate) {
			var str = '';
			var name = '';
			$.each(items, function (index, content) {
				var checked = "";
				if (content.checked != undefined) {
					if (content.checked) {
						checked = 'checked="checked"';
					}
				}
				str += '<div class="checkbox"><label>';
				str += '<input type="checkbox" name="' + content.name
				 + '" value="' + content.value + '" ' + validate + ' '
				 + checked + '>' + content.text + '</label></div>';
				name = content.name;
			});
			return str;
		},
		// checkbox组渲染
		_getCheckboxGroup : function (element_data) {
			var that = this;
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '6';
			if (element_data.span != undefined) {
				span = element_data.span;
			}
			str += '<div id="' + element_data.id+ '" data-type="checkbox" class="col-sm-' + span + ' clearfix">';
			var validate = '';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key]+ '" ';
					}
				}
				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}
			if (element_data.items != undefined) {
				var items = element_data.items;
				str += this._getCheckboxs(items, validate);
				
			}
			if (element_data.itemsUrl != undefined) {
				$.ajax({
					type:"post",
					url:element_data.itemsUrl,
					data:{},
					dataType:"json",
					async:true,
					success: function(res){
					var urlItems;
						if (typeof res == "object") {
							urlItems = res;
						} else {
							var json = eval("(" + res + ")");
							urlItems = json;
						}
						var urlCheckboxs = that._getAjaxCheckboxs(urlItems,validate);
						if (that.$form.find("#" + element_data.id).find('.error').length > 0) {
							that.$form.find("#" + element_data.id).find('.error').before(urlCheckboxs);
						} else {
							urlCheckboxs += '<label for="'+ urlItems[0].name+ '" class="error"></label>';
							that.$form.find("#" + element_data.id).append(urlCheckboxs);
						}
					}
				});
			}
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'+ element_data.detail + '</p></div>';
			}
			str += '</div>'
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}
			return str;
		},
		// radio渲染
		_getRadios : function (items, validate) {
			var str = '';
			var name = '';
			$.each(items, function (index, content) {
				var checked = "";
				var Intext='';
				if (content.checked != undefined) {
					if (content.checked) {
						checked = 'checked="checked"';
					}
				}
				if(content.typetext){
					Intext='<input class="form-control" type="text" name="'+content.typename+'"/>'
				}
				str += '<div class="radio"><label>';
				str += '<input type="radio" name="' + content.name
				 + '" value="' + content.value + '"  ' + validate + ' '
				 + checked + '>' + content.text +Intext +'</label></div>';
				name = content.name;
			});
			str += '<label for="' + name + '" class="error"></label>';
			return str;
		},
		// ajax加载radio
		_getAjaxRadios : function (items, validate) {
			var str = '';
			var name = '';
			$.each(items, function (index, content) {
				var checked = "";
				if (content.checked != undefined) {
					if (content.checked) {
						checked = 'checked="checked"';
					}
				}
				str += '<div class="radio"><label>';
				str += '<input type="radio" name="' + content.name
				 + '" value="' + content.value + '"  ' + validate + ' '
				 + checked + '>' + content.text + '</label></div>';
				name = content.name;
			});
			return str;
		},
		// 渲染raido组
		_getRadioGroup : function (element_data) {
			var that = this;
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '6';
			if (element_data.span != undefined) {
				span = element_data.span;
			}
			str += '<div id="' + element_data.id
			 + '" data-type="radio" class="col-sm-' + span + '">';
			var validate = '';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key]+ '" ';
					}
				}

				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}
			if (element_data.items != undefined) {
				var items = element_data.items;
				str += this._getRadios(items, validate);
			}
			if (element_data.itemsUrl != undefined) {
				$.ajax({
					type:"post",
					url:element_data.itemsUrl,
					data:{},
					dataType:"json",
					async:true,
					success: function(res){
						var urlItems;
						if (typeof res == "object") {
							urlItems = res;
						} else {
							var json = eval("(" + res + ")");
							urlItems = json;
						}
						var urlRadios = that._getAjaxRadios(urlItems,validate);
						if (that.$form.find("#" + element_data.id).find('.error').length > 0) {
							that.$form.find("#" + element_data.id).find('.error').before(urlRadios);
						} else {
							urlRadios += '<label for="' + urlItems[0].name+ '" class="error"></label>';
							that.$form.find("#" + element_data.id).append(urlRadios);
						}
					}

				});
			}
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			str += '</div>'
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}
			return str;
		},
		// select的option渲染
		_getOptions : function (items, value) {
			var str = '';
			$.each(items, function (index, content) {
				var select = ""
					if (value != "") {
						if (content.value == value) {
							select = 'selected="selected"';
						}
					}
					if (content.selected == true) {
						select = 'selected="selected"';
					}
					str += '<option ' + select + ' value="' + content.value + '">'
					 + content.text + '</option>';
			});
			return str;
		},
		// select渲染
		_getSelect : function (element_data) {
			var that = this;
			var str = '<div class="form-group">';
			str += '<label class="col-sm-' + this._labelSpan
			 + ' control-label">' + element_data.label + '</label>';
			var span = '6';
			if (element_data.span != undefined) {
				span = element_data.span;
			}
			str += '<div class="col-sm-' + span + '">';
			var validate = '';
			if (this._isValidate) {
				if (element_data.rule != undefined) {
					var rule = element_data.rule;
					for (var key in rule) {
						validate += 'data-rule-' + key + '="' + rule[key]
						 + '" ';
					}
				}

				if (element_data.msg != undefined) {
					var msg = element_data.msg;
					for (var key in msg) {
						validate += 'data-msg-' + key + '="' + msg[key] + '" ';
					}
				}
			}

			var value = "";
			if (element_data.value != undefined) {
				value = element_data.value;
			}
			str += '<select class="form-control m-b" name="'
			 + element_data.name + '" id="' + element_data.id + '" '
			 + validate + '>';
			if (element_data.items != undefined) {
				var items = element_data.items;
				str += this._getOptions(items, value);
			}
			if (element_data.itemsUrl != undefined) {
				$.post(element_data.itemsUrl, {}, function (res) {
					var urlItems;
					if (typeof res == "object") {
						urlItems = res;
					} else {
						var json = eval("(" + res + ")");
						urlItems = json;
					}
					var urlOptions = that._getOptions(urlItems, value);
					that.$form.find("#" + element_data.id).append(urlOptions);
				});
			}
			str += '</select>';
			str += '</div>';
			if (element_data.detail != undefined) {
				str += '<div class="col-sm-2"><p class="form-control-static">'
				 + element_data.detail + '</p></div>';
			}
			str += '</div>'
			if (this._showLine) {
				str += '<div class="hr-line-dashed"></div>';
			}
			return str;

		},
		_remove : function () {
			this.$element.html('');
		}
	}

	var form = function (options) {
		options = $.extend({}, HwForm.defaults, options);
		var eles = [];
		this.each(function () {
			var self = this;
			var form = new HwForm(self, options);
			eles.push(form);
		});
		return eles[0];
	};
	var loadUrl = function (url) {
		this.each(function () {
			var self = this;
			$.post(url, {}, function (res) {
				var form_data;
				if (typeof res == "object") {
					form_data = res;
				} else {
					var json = eval("(" + res + ")");
					form_data = json;
				}
				for (var name in form_data) {
					var ele = $(self).find("[name='" + name + "']");
					if (ele.is('input[type="text"]')) {
						ele.val(form_data[name]);
					} else if (ele.is('input[type="radio"]')) {
						for (var i in ele) {
							if (ele[i].value == form_data[name]) {
								ele[i].checked = true;
							}
						}
					} else if (ele.is('input[type="checkbox"]')) {
						var values = form_data[name].split(",");
						for (var i in ele) {
							if (values.indexOf(ele[i].value) != -1) {
								ele[i].checked = true;
							}
						}
					} else if (ele.is('input[type="hidden"]')) {
						if (ele.attr("data-hidden") == "true") {
							ele.val(form_data[name]);
							var tree = $.fn.zTree.getZTreeObj(ele.attr("data-tree-id"));
							if (tree != undefined) {
								tree.reAsyncChildNodes(-1, "refresh");
							}
						} else {
							ele.val(form_data[name]);
						}
					}
					if (ele.is('select')) {
						ele.val(form_data[name]);
					}
					if (ele.is('textarea')) {
						ele.html(form_data[name]);
					}
					if (ele.is('p')) {
						if (ele.attr("data-type") == "image") {
							var img = $('<img alt="图片">');
							img.attr("src", form_data[name]);
							img.attr("width", ele.attr("width"));
							img.attr("height", ele.attr("height"));
							ele.html(img);
						} else {
							ele.text(form_data[name]);
						}

					}
				}
			});
		});
	};
	var loadData = function (param) {
		this.each(function () {
			var self = this;
			var form_data;
			if (typeof param == "object") {
				form_data = param;
			} else {
				var json = eval("(" + param + ")");
				form_data = json;
			}
			for (var name in form_data) {
				var ele = $(self).find("[name='" + name + "']");
				if (ele.is('input[type="text"]')) {
					ele.val(form_data[name]);
				} else if (ele.is('input[type="radio"]')) {
					for (var i in ele) {
						if (ele[i].value == form_data[name]) {
							ele[i].checked = true;
						}
					}
				} else if (ele.is('input[type="checkbox"]')) {
					var values = form_data[name].split(",");
					for (var i in ele) {
						if (values.indexOf(ele[i].value) != -1) {
							ele[i].checked = true;
						}
					}
				} else if (ele.is('input[type="hidden"]')) {
					if (ele.attr("data-hidden") == "true") {
						ele.val(form_data[name]);
						var tree = $.fn.zTree.getZTreeObj(ele
								.attr("data-tree-id"));
						if (tree != undefined) {
							tree.reAsyncChildNodes(-1, "refresh");
						}
					}
					ele.val(form_data[name]);
				}
				if (ele.is('select')) {
					ele.val(form_data[name]);
				}
				if (ele.is('textarea')) {
					ele.html(form_data[name]);
				}
				if (ele.is('p')) {
					if (ele.attr("data-type") == "image") {
						var img = $('<img alt="图片">');
						img.attr("src", form_data[name]);
						img.attr("width", ele.attr("width"));
						img.attr("height", ele.attr("height"));
						ele.html(img);
					} else {
						ele.text(form_data[name]);
					}

				}
			}
		});
	};
	$.fn.extend({
		'HwForm' : form
	});
	$.fn.extend({
		'loadUrl' : loadUrl
	});
	$.fn.extend({
		'loadData' : loadData
	});

})(jQuery, window, document);
