;(function ($, window, document, undefined) {

	var HwGrid = function (element, options) {
		// jquery元素变量
		this.$element = $(element);
		// js元素对象
		this._element = element;
		// id
		this._elementId = this._element.id;
		// 表id
		this._tableId = 'hw_table_' + this._elementId;
		// 表jquery元素
		this.$table = new Object;
		this._clospan = 0;
		// box是否初始化
		this.boxInited = false;
		// 工具栏是否初始化
		this.searchInited = false;
		// 当前属性
		this._options = options;
		// 初始化属性
		SetAttribute(this._options, this);
		if (this._data != undefined) {
			// 初始化
			this._init();
		} else {
			// 异步加载
			this._load();
		}
	};
	// 设置属性函数
	var SetAttribute = function (options, that) {
		// grid数据
		that._data = options.data;
		// grid各列属性
		that._cloums = options.cloums;
		// ajax路径
		that._url = options.url;
		// 当前页
		that._pageNum = options.pageNum;
		// 每页条数
		that._pageSize = options.pageSize;
		// id域
		that._id_filed = options.id_filed;
		// td样式变量
		that._td_style = new Array();
		// checkbox

		that._show_check = options.show_check;

		that._showIndex = options.showIndex;

		that._checkType = options.checkType;

		that._showPaging = options.showPaging;

		that._showMoveTools = options.showMoveTools;

		that._moveToolsWidth = options.moveToolsWidth;

		that._moveUpHandle = options.moveUpHandle;

		that._moveDownHandle = options.moveDownHandle;

		that._showWordsCount = options.showWordsCount;

		that._editRow = options.editRow;

		that._editRowWidth = options.editRowWidth;

		that._showRowDelete = options.showRowDelete;

		that._rowDeleteHandle = options.rowDeleteHandle;

		that._showEditHandle = options.showEditHandle;

		that._rowEditSaveHandle = options.rowEditSaveHandle;

		that._rowAddSaveHandle = options.rowAddSaveHandle;

		if (options.sortFiled != undefined) {
			// box元素
			that._sortFiled = options.sortFiled;
		}
		if (options.callback != undefined) {
			// box元素
			that.callfun = options.callback;
		}
		if (options.sortType != undefined) {
			// box元素
			that._sortType = options.sortType;
		}

		if (options.box != undefined) {
			// box元素
			that._box = options.box;
		}
		if (options.tools != undefined) {
			// 工具栏
			that._tools = options.tools;
		}
		if (options.bTools != undefined) {
			// 工具栏
			that._bTools = options.bTools;
			that._bToolsAlign = options.bToolsAlign;
		}
		if (options.search != undefined) {
			// 搜索元素
			that._search = options.search;
			// 表格按钮
			that._search_items = options.search.items;
		}
		if (options.actionCloums != undefined) {
			// 操作栏
			that._actionCloums = options.actionCloums;
		}
		if (options.actionCloumsWidth != undefined) {
			// 操作栏
			that._actionCloumsWidth = options.actionCloumsWidth;
		}
		// 操作栏显示文本
		that._actionCloumText = options.actionCloumText;
	};

	// 默认构造参数
	HwGrid.defaults = {
		actionCloumText : "操作",
		pageNum : 1,
		pageSize : 20,
		show_check : true,
		checkType : "checkbox",
		showPaging : true,
		showMoveTools : false,
		showWordsCount : 20,
		editRow : false,
		showEditHandle : function () {
			return true;
		},
		showRowDelete : true,
		rowDeleteHandle : function () {},
		bToolsAlign : "right",
		showIndex : true
	};

	// 继承属性
	HwGrid.prototype = {
		// 重新加载grid
		reload : function (options) {
			if (options != undefined) {
				this._options = $.extend({}, this._options, options);
				SetAttribute(this._options, this);
			}
			this._load();
		},
		// 下一页
		nextPage : function () {
			if (this._pageNum < this._getTotalPage()) {
				this._pageNum++;
				this._load();
			}
		},
		// 上一页
		prePage : function () {
			if (this._pageNum > 1) {
				this._pageNum--;
				this._load();
			}
		},
		// 跳转页面
		goPage : function (num) {
			var reg = /^[0-9]*[1-9][0-9]*$/;
			if (reg.test(num) && num <= this._getTotalPage()) {
				this._pageNum = num;
				this._load();
			}
		},
		// 获取当前选中节点id
		currentCheckeds : function () {
			var ids = [];
			var checkboxs = document
				.getElementsByName(this._elementId + "_ids");
			for (var i = 0; i < checkboxs.length; i++) {
				if (checkboxs[i].checked) {
					ids.push(checkboxs[i].value);
				}
			}
			return ids;
		},
		swapRow : function (from, to) {
			this._swapRow(from, to);
			this._reSeq();
		},
		moveDown : function (current) {
			if (current != undefined) {
				var from = parseInt(current);
				var to = from + 1;
				this.swapRow(from, to);
			} else {
				if (this._getCurrentSeq() != null) {
					var from = parseInt(this._getCurrentSeq());
					var to = from + 1;
					this.swapRow(from, to);
				}
			}
		},
		moveUp : function (current) {
			if (current != undefined) {
				var from = parseInt(current);
				var to = from - 1;
				this.swapRow(to, from);
			} else {
				if (this._getCurrentSeq() != null) {
					var from = parseInt(this._getCurrentSeq());
					var to = from - 1;
					this.swapRow(to, from);
				}
			}
		},
		moveButtom : function (current) {
			if (current != undefined) {
				var from = parseInt(current);
				if (from < this._pageSize - 1) {
					this.swapRow(from, this._pageSize - 1);
				}
			} else {
				if (this._getCurrentSeq() != null) {
					var from = parseInt(this._getCurrentSeq());
					if (from < this._pageSize - 1) {
						this.swapRow(from, this._pageSize - 1);
					}
				}
			}
		},
		moveTop : function (current) {
			if (current != undefined) {
				var from = parseInt(current);
				if (from > 0) {
					this._swapRowTop(from, 0);
					this._reSeq();
				}
			} else {
				if (this._getCurrentSeq() != null) {
					var from = parseInt(this._getCurrentSeq());
					if (from > 0) {
						this._swapRowTop(from, 0);
						this._reSeq();
					}
				}
			}
		},
		getCurrentDatas : function () {
			var datas = [];
			var ids = this._getCurrentSeqs();
			for (var i in ids) {
				datas.push(this._data.list[ids[i]]);
			}
			return datas;
		},
		checkIds : function (ids) {
			var array = ids.split(",");
			for (var i in array) {
				$("input[value=" + array[i] + "]").trigger("click");
			}
		},
		checkAll : function () {
			$("#" + this._elementId + "_checkbox_all").trigger("click");
		},
		editRow : function (id) {
			var editClos = new Array();
			$.each(this._cloums, function (index, content) {
				if (content.edit == true) {
					editClos.push(content);
				}
			});
			var tr = this.$table.find("tr[data-id=" + id + "]");
			tr.find("td[data-edit=true]").each(function (index) {
				var that2 = this;
				var content = editClos[index];
				var dataType = content.type;
				if (dataType == "input") {
					var title = $(this).attr("title");
					var value = $(this).text();
					var ele = $('<input style="width:90%" data-param=true data-id="'
							 + $(this).attr("data-id")
							 + '" name="'
							 + $(this).attr("data-name")
							 + '" type="text"/>');
					ele.val(title);
					$(this).html("");
					$(this).append(ele);
				} else if (dataType == "datepicker") {
					var value = $(this).text();
					var ele = $('<input style="width:90%" data-param=true data-id="'
							 + $(this).attr("data-id")
							 + '" name="'
							 + $(this).attr("data-name")
							 + '" type="text"/>');
					ele.val(value);
					$(this).html("");
					$(this).append(ele);

					var istime = false;
					if (content.isTime != undefined) {
						istime = content.isTime;
					}
					var dateFormat = "YYYY-MM-DD hh:mm:ss";
					if (content.dateFormat != undefined) {
						dateFormat = content.dateFormat;
					}
					var min = "";
					if (content.min != undefined) {
						min = "'" + content.min + "'";
					}
					var max = "";
					if (content.max != undefined) {
						max = "'" + content.max + "'";
					}
					var choose = function () {};
					if (content.choose) {
						choose = content.choose;
					}
					ele.click(function (e) {
						laydate({
							istime : istime,
							min : min,
							max : max,
							format : dateFormat,
							choose : function (data) {
								choose(data);
							}
						});
						$(this).val(value);
					});
				} else if (dataType == "select") {
					var ele = $('<select style="width:90%" data-param=true data-id="'
							 + $(this).attr("data-id")
							 + '" name="'
							 + $(this).attr("data-name")
							 + '"></select>');
					$.each(content.items,function (index, data) {
						var option = $('<option '+ ($(that2).attr("data-value") == data.value ? "selected=\"selected\"": "")
								 + ' value="'
								 + data.value
								 + '">'
								 + data.text
								 + '</option>');
						ele.append(option);
					});
					$(this).html("");
					$(this).append(ele);
				} else if (content.type == "image") {
					ele = $(this).find("img");
					ele.bind("click", function (e) {
						if (content.uploadHandle) {
							content.uploadHandle($(that2));
						}
					});
				} else {
					console.error("未定义可编辑列的类型（type）");
				}

			});
		},
		cancelEditRow : function (id) {
			var that = this;
			var tr = this.$table.find("tr[data-id=" + id + "]");
			tr.find("td[data-edit=true]").each(function () {
				var type = $(this).attr("data-type");
				if (type == "image") {
					$(this).html($(this).attr("title"));
					$(this).find("img").unbind("click");
				} else {
					var title = $(this).attr("title");
					var value = subString(title, that._showWordsCount);
					$(this).html(value);
				}
			});
		},
		getRowData : function (id) {
			var that = this;
			var tr = this.$table.find("tr[data-id=" + id + "]");
			var first = true;
			var params = "";
			tr.find("[data-param=true]").each(
				function () {
				if (first) {
					first = false;
					params += ("?" + $(this).attr("name") + "=" + $(
							this).val());
				} else {
					params += ("&" + $(this).attr("name") + "=" + $(
							this).val());
				}
			});
			return params;
		},
		addRow : function () {
			this._addRow();
		},
		// 初始化
		_init : function () {
			if (this._box != undefined) {
				this._renderBox();
			} else {
				if (this._tools != undefined && !this.toolsInited) {
					this._renderTools();
					this.toolsInited = true;
				}
				if (this._search != undefined && !this.searchInited) {
					this._renderSearch();
					this.searchInited = true;
				}
				this._renderTable();
			}
			this._renderThead();
			this._renderTbody();
			if (this._show_check && this._checkType == "checkbox") {
				this._checkboxInit();
			}
			if (this._bTools) {
				this._renderTfoot();
			}
			if (this._showPaging) {
				this._randerPaging();
				this._initPageEvent();
			}
		},
		// 异步加载
		_load : function () {
			var that = this;
			var form_data = "";
			if (this.$searchForm != undefined) {
				if (that._url.indexOf("?") != -1) {
					form_data = "&"
				} else {
					form_data = "?"
				}
				form_data += $("#" + this._elementId + "_search_form").serialize();
			}
			$.ajax({
				type:"post",
				url:that._url+form_data,
				data:{pageNum:that._pageNum,pageSize:that._pageSize},
				dataType:"json",
				async:false,
				success:function(res){
					if (typeof res == "object") {
						that._data = res;
					} else {
						var json = eval("(" + res + ")");
						that._data = json;
					}
					that._remove();
					var totalP = that._getTotalPage();
					if (that._pageNum > totalP) {
						that._pageNum = 1;
					}
					that._init();
					that.callfun(that,that._data);
				}

			});
			/*$.post(that._url + form_data, {
				pageNum : that._pageNum,
				pageSize : that._pageSize
			}, function (res) {

			});*/
		},
		// 删除
		_remove : function () {
			if (this._box != undefined) {
				this.$element.html('');
			} else {
				$('#' + this._tableId).remove();
			}
			$('#' + this._elementId + '_page_tool').remove();
			this.boxInited = false;
		},
		// 异步刷新表格
		_refresh : function () {
			this._load();
		},
		// 渲染工具栏
		_renderTools : function () {
			var row = $('<div class="row"></div>');
			var col = this._initTools();
			row.append(col);
			this.$element.append(row);
		},
		// 初始工具栏
		_initTools : function () {
			var col = $('<div class="col-sm-12 m-b-xs"></div>');
			$.each(this._tools, function (index, content) {
				var button = $('<button type="button" class="btn '
						 + content.cls + '">' + content.text + '</button>');
				button.click(content.handle);
				col.append(button);
				//col.append('&nbsp;');
			});
			return col;
		},
		// 渲染搜索
		_renderSearch : function () {
			var that = this;
			var row = $('<div class="row"></div>');
			this.$element.append(row);
			var col = $('<div class="col-sm-12 m-b-xs lh-40"></div>');
			var searchForm = $('<form id="' + that._elementId
					 + '_search_form" class="form-inline"></form>');
			this.$searchForm = searchForm;
			col.append(searchForm);
			row.append(col);
			$.each(this._search_items, function (index, content) {
				that._initSearchItems(content);
			});
			var searchBtn = $('<button type="button" class="btn btn-primary">搜索</button>');
			searchForm.append(searchBtn);
			var fun = this._search.submitHandle;
			searchBtn.click(function () {
				that._pageNum = 1;
				that._load();
				if (that._search.submitHandle != undefined) {
					fun();
				}
			});
			//searchForm.append("&nbsp;");
			var resetBtn = $('<button type="reset" class="btn">重置</button>');
			searchForm.append(resetBtn);
		},
		// 初始搜索
		_initSearchItems : function (content) {
			var that = this;
			if (content.type == 'text') {
				this.$searchForm.append(this._getText(content));
			}
			if (content.type == 'select') {
				this.$searchForm.append(this._getSelect(content));
			}
			if (content.type == 'radioGroup') {
				this.$searchForm.append(this._getRadioGroup(content));
			}
			if (content.type == 'checkboxGroup') {
				this.$searchForm.append(this._getCheckboxGroup(content));
			}
			if (content.type == 'datepicker') {
				this.$searchForm.append(this._getDatepicker(content));
				this._regiestDatepickerEvents(content);
			}
			if (content.type == 'divider') {
				this.$searchForm.append("<br>");
			}
			// 待增加别的类型
		},
		// 搜索元素之text
		_getText : function (content) {
			var str = '<div class="form-group">';
			str += '<label>' + content.label + '</label>';
			str += '<input type="text" name="' + content.name + '" value="'
			 + (content.value == undefined ? "" : content.value) + '"'
			 + '" class="form-control">';
			str += '</div>';
			return str;
		},
		// 搜索元素之select的option
		_getOptions : function (items) {
			var str = '';
			$.each(items, function (index, content) {
				var select = "";
				if (content.selected) {
					select = 'selected="selected"';
				}
				str += '<option value="' + content.value + '" ' + select + '>'
				 + content.text + '</option>';
			});
			return str;
		},
		// 搜索元素之select
		_getSelect : function (content) {
			var that = this;
			var str = '<div class="form-group">';
			str += '<label>' + content.label + '</label>';
			str += '<select class="form-control" name="' + content.name
			 + '" id="' + content.id + '">';
			if (content.items != undefined) {
				var items = content.items;
				str += this._getOptions(items);
			}
			if (content.itemsUrl != undefined) {
				$.post(content.itemsUrl, {}, function (res) {
					var urlItems;
					if (typeof res == "object") {
						urlItems = res;
					} else {
						var json = eval("(" + res + ")");
						urlItems = json;
					}
					var urlOptions = that._getOptions(urlItems);
					that.$searchForm.find("#" + content.id).append(urlOptions);
				});
			}
			str += '</select></div>';
			return str;
		},
		_getRadios : function (items) {
			var str = '';
			$.each(items, function (index, content) {
				var check = "";
				if (content.checked) {
					check = 'checked="checked"';
				}
				str += '<label class="checkbox-inline">';
				str += '<input type="radio" name="' + content.name
				 + '" value="' + content.value + '" ' + check + '>'
				 + content.text + '</label>';
			});
			return str;
		},
		_getAjaxRadios : function (items) {
			var str = '';
			$.each(items, function (index, content) {
				var check = "";
				if (content.checked) {
					check = 'checked="checked"';
				}
				str += '<label class="checkbox-inline">';
				str += '<input type="radio" name="' + content.name
				 + '" value="' + content.value + '" ' + check + '>'
				 + content.text + '</label>';
			});
			return str;
		},
		_getRadioGroup : function (element_data) {
			var that = this;
			var str = '<div id="' + element_data.id + '" class="form-group">';
			str += '<label class="control-label">' + element_data.label
			 + '</label>';
			if (element_data.items != undefined) {
				var items = element_data.items;
				str += this._getRadios(items);
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
					var urlRadios = that._getAjaxRadios(urlItems);
					that.$searchForm.find("#" + element_data.id).append(
						urlRadios);
				});
			}
			str += '</div>'
			return str;
		},
		// checkbox渲染
		_getCheckboxs : function (items) {
			var str = '';
			$.each(items, function (index, content) {
				var check = "";
				if (content.checked) {
					check = 'checked="checked"';
				}
				str += '<label class="checkbox-inline">';
				str += '<input type="checkbox" name="' + content.name
				 + '" value="' + content.value + '"' + check + '>'
				 + content.text + '</label>';
			});
			return str;
		},
		// ajax异步加载checkbox
		_getAjaxCheckboxs : function (items) {
			var str = '';
			$.each(items, function (index, content) {
				var check = "";
				if (content.checked) {
					check = 'checked="checked"';
				}
				str += '<label class="checkbox-inline">';
				str += '<input type="checkbox" name="' + content.name
				 + '" value="' + content.value + '"' + check + '>'
				 + content.text + '</label>';
			});
			return str;
		},
		_getCheckboxGroup : function (element_data) {
			var that = this;
			var str = '<div id="' + element_data.id + '" class="form-group">';
			str += '<label class="control-label">' + element_data.label
			 + '</label>';

			if (element_data.items != undefined) {
				var items = element_data.items;
				str += this._getCheckboxs(items);
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
					var urlCheckboxs = that._getAjaxCheckboxs(urlItems);
					that.$searchForm.find("#" + element_data.id).append(
						urlCheckboxs);
				});
			}
			str += '</div>'
			return str;
		},
		_getDatepicker : function (element_data) {
			var str = '<div id="' + element_data.id
				 + '_div" class="form-group">';
			str += '<label>' + element_data.label + '</label>';
			var value = '';
			if (element_data.value != undefined) {
				value = element_data.value;
			}
			var istime = false;
			if (element_data.isTime != undefined) {
				istime = element_data.isTime;
			}
			var format = "YYYY-MM-DD hh:mm:ss";
			if (element_data.format != undefined) {
				format = element_data.format;
			}
			var min = "";
			if (element_data.min != undefined) {
				min = "min : '" + element_data.min + "', ";
			}
			var max = "";
			if (element_data.max != undefined) {
				max = "max : '" + element_data.max + "', ";
			}
			var readonly = "";
			if (element_data.readonly) {
				readonly = "readonly=\"readonly\"";
			}
			str += '<input type="text" class="form-control layer-date" name="'
			 + element_data.name + '" id="' + element_data.id + '" '
			 + readonly + '>';
			str += '<label id="' + element_data.id
			 + '_label" class="btn btn-primary">选择</label>';
			str += '</div>'
			return str;
		},
		// 注册日期控件点击事件
		_regiestDatepickerEvents : function (element_data) {
			var istime = false;
			if (element_data.isTime != undefined) {
				istime = element_data.isTime;
			}
			var format = "YYYY-MM-DD hh:mm:ss";
			if (element_data.format != undefined) {
				format = element_data.format;
			}
			var min = "";
			if (element_data.min != undefined) {
				min = "'" + element_data.min + "'";
			}
			var max = "";
			if (element_data.max != undefined) {
				max = "'" + element_data.max + "'";
			}
			var choose = function () {};
			if (element_data.choose) {
				choose = element_data.choose;
			}
			$("#" + element_data.id).click(function () {
				laydate({
					istime : istime,
					min : min,
					max : max,
					format : format,
					choose : function (data) {
						choose(data);
					}
				});
			});
			$("#" + element_data.id + "_label").click(function () {
				laydate({
					istime : istime,
					min : min,
					max : max,
					format : format,
					elem : "#" + element_data.id,
					choose : function (data) {
						choose(data);
					}
				});
			});
		},
		// 渲染包裹grid的box
		_renderBox : function () {
			if (this.boxInited) {
				return;
			}
			var ibox = $('<div class="ibox float-e-margins"></div>');
			var title = $('<div class="ibox-title"></div>')
				var h5 = $('<h5>' + this._box.title + '</h5>');
			var tools = $('<div class="ibox-tools"></div>');
			if (this._box.tools.collapse) {
				tools
				.append('<a class="collapse-link"><i class="fa fa-chevron-up"></i></a>');
			}
			if (this._box.tools.close) {
				tools
				.append(' <a class="close-link"><i class="fa fa-times"></i></a>');
			}
			title.append(h5);
			title.append(tools);
			var content = $('<div class="ibox-content"></div>');
			var gridwrapper = $('<div class="dataTables_wrapper form-inline" role="grid"></div>');
			var table = $('<table id="'
					 + this._tableId
					 + '" class="table table-striped table-bordered table-hover dataTables-example"></table>');
			gridwrapper.append(table);
			content.append(gridwrapper);
			ibox.append(title);
			ibox.append(content);
			this.$element.append(ibox);
			this.$table = table;
			this.boxInited = true;
		},
		// 渲染表格
		_renderTable : function () {
			var table = $('<table id="'
					 + this._tableId
					 + '" class="table table-striped table-bordered table-hover dataTables-example  dataTable"></table>');
			this.$table = table;
			this.$element.append(table);
		},
		// 渲染表格头部
		_renderThead : function () {
			var clospan = 0;
			var checkbox_str = '';
			if (this._show_check == true) {
				checkbox_str = '<th style="vertical-align: middle;width:3%;">';
				if (this._checkType == "checkbox") {
					checkbox_str += '<input id="' + this._elementId
					 + '_checkbox_all" data-title="' + this._elementId
					 + '_checkbox_all" data-set="#' + this._elementId
					 + ' .i-checks" class="i-checks" type="checkbox"/>';
				}
				checkbox_str += '</th>';
				clospan++;
			}
			this.$table.append('<thead><tr>' + checkbox_str + '</tr></thead>');
			if (this._showIndex == true) {
				$('#' + this._tableId + ' > thead > tr').append(
					'<th style="width:3%;vertical-align: middle;">#</th>');
				clospan++;
			}
			var that = this;
			$.each(that._cloums,
				function (index, content) {
				var style = "";
				var sort = "";
				var type = "";
				if (content.width != undefined) {
					style += "width:" + content.width + ";";
				}
				if (content.align != undefined) {
					style += "text-align:" + content.align + ";";
				}
				style += "vertical-align:middle;";
				if (content.sort != undefined && content.sort) {
					if (that._sortFiled == content.filed) {
						if (that._sortType == "desc") {
							sort = 'class="sorting_desc"';
						} else {
							sort = 'class="sorting_asc"';
						}
					} else {
						sort = 'class="sorting"';
					}
				}
				// 记录表头各个列的样式
				that._td_style[index] = style;
				var th = $('<th ' + sort + ' style="background-color:#F5F5F6;' + style + '">' + content.title
						 + '</th>');
				$('#' + that._tableId + ' > thead > tr').append(th);
				if (content.sort != undefined && content.sort) {
					th.click(function () {
						if (content.sortHandle != undefined) {
							if (that._sortFiled == undefined) {
								that._sortType = "desc";
							}
							content.sortHandle(content.filed, that._sortType);
						}
					});
				}
				clospan++;
			});
			// 操作栏
			if (that._actionCloums != undefined) {
				var width = (this._actionCloumsWidth == undefined ? "20%" : this._actionCloumsWidth);
				$('#' + this._tableId + ' > thead > tr').append(
					'<th style="vertical-align: middle;text-align:center;width:' + width + '">'
					 + this._actionCloumText + '</th>');
				clospan++;
			}
			if (this._editRow) {
				var width = (this._editRowWidth == undefined ? "13%" : this._editRowWidth);
				$('#' + this._tableId + ' > thead > tr').append(
					'<th style="vertical-align: middle;text-align:center;width:' + width
					 + '">修改本行数据</th>');
				clospan++;
			}
			if (this._showMoveTools) {
				var width = (this._moveToolsWidth == undefined ? "12%" : this._moveToolsWidth);
				$('#' + this._tableId + ' > thead > tr').append(
					'<th style="vertical-align: middle;text-align:center;width:' + width
					 + '">移动</th>');
				clospan++;
			}
			this._clospan = clospan;
		},
		// 渲染表格主体
		_renderTbody : function () {
			this.$table.append('<tbody></tbody>');
			var head_array = [];
			var head_index = [];
			var formate_array = [];
			var edit_array = [];
			var type_array = [];
			var that = this;
			$.each(that._cloums, function (index, content) {
				head_array.push(content.filed);
				head_index.push(index);
				formate_array.push(content.format);
				edit_array.push(content.edit == undefined ? false : true);
				type_array.push(content.type == undefined ? "" : content.type);
			});
			var id_filed = that._id_filed;
			if (that._data.list != undefined && that._data.list != null) {
				var limit = that._data.list.length;
				$.each(that._data.list,function (index, content) {
					var current_data = content;
					var thispage = that._pageNum;
					var pagesize = that._pageSize;
					var tr = $('<tr data-id="'
							 + content[id_filed] + '" data-seq='
							 + index + '></tr>');
					// tr.data("data", content);
					var str = "";
					var num = (thispage - 1) * pagesize + index
					 + 1;
					for (var i = 0; i < head_array.length; i++) {
						if (i == 0) {
							if (that._show_check == true) {
								str += ('<td style="vertical-align: middle;"><input name="'
									 + that._elementId
									 + '_ids" data-title="'
									 + that._elementId
									 + '_checkbox" type="'
									 + that._checkType
									 + '" value="'
									 + content[id_filed] + '"/></td>');
							}
							if (that._showIndex == true) {
								str += ('<td style="vertical-align: middle;" data-type="index">'
									 + num + '</td>');
							}
						}
						var format_str = "";
						var title = "";
						if (formate_array[i] != undefined) {
							var fun = formate_array[i];
							var value = content[head_array[i]] == null ? ""
								 : content[head_array[i]];
							format_str = fun(num, current_data);
							if (edit_array[i] != true) {
								title = value;
							} else {
								title = format_str;
							}
							str += ('<td data-id="'
								 + content[id_filed]
								 + '" data-type="'
								 + type_array[i]
								 + '" data-name="'
								 + head_array[i]
								 + '" style='
								 + that._td_style[head_index[i]]
								 + ' data-edit='
								 + edit_array[i]
								 + ' data-value="' + value
								 + '" title="' + title
								 + '">' + format_str + '</td>');
						} else {
							var value = content[head_array[i]] == null ? ""
								 : content[head_array[i]];
							var title = value;
							if (value.length > that._showWordsCount) {
								value = value.substring(0,
										that._showWordsCount)
									 + "...";
							}
							str += ('<td style="vertical-align:middle;text-align:center;" data-id="'
								 + content[id_filed]
								 + '" data-type="'
								 + type_array[i]
								 + '" data-edit='
								 + edit_array[i]
								 + ' data-name="'
								 + head_array[i]
								 + '" title="'
								 + title
								 + '" style='
								 + that._td_style[head_index[i]]
								 + '>' + value + '</td>');
						}

					}
					tr.append(str);
					if (that._actionCloums != undefined) {
						var cltd = $('<td style="vertical-align: middle;text-align:center;"></td>');
						tr.append(cltd);
						$.each(that._actionCloums,function (index, content) {
							var text = '';
							if (content.text != undefined) {
								text = content.text;
							}
							if (content.textHandle != undefined) {
								text = content.textHandle(num,current_data);
							}
							var ids =content.id==undefined?"":content.id;
							var cls = content.cls == undefined ? "": "class=\""+ content.cls+ "\"";
							var a = $('<a ' + cls+ ' id="'+ ids + '">'+ text+ '</a>');
							a.click(function (e) {
								content.handle(num,current_data,$(this));
								e.stopPropagation();
							});
							cltd.append(a);
							//cltd.append('&nbsp;');
						});
					}

					if (that._editRow) {
						var td = $('<td style="vertical-align:middle;text-align:center;"></td>');
						tr.append(td);
						if (that
							._showEditHandle(index, content) != false) {
							var edit_a = $('<a title="编辑" class="btn btn-xs btn-outline btn-primary">编辑</a>');
							var save_a = $('<a title="保存" class="btn btn-xs btn-outline btn-primary">保存</a>');
							var cancel_a = $('<a title="取消" class="btn btn-xs btn-outline btn-primary">取消</a>');
							var delete_a = $('<a title="删除" class="btn btn-xs btn-outline btn-danger">删除</a>')
								td.append(edit_a);
							td.append(save_a);
							td.append(cancel_a);
							if (that._showRowDelete) {
								td.append(delete_a);
								delete_a.click(function (e) {
									that._rowDeleteHandle(index, content);
									e.stopPropagation();
								});
							}
							save_a.hide();
							cancel_a.hide();
							edit_a.click(function (e) {
								if (that.$table.find("tr[data-add=true]").length > 0) {
									return false;
								}
								if (that.$table.find("[data-param=true]").length > 0) {
									return false;
								}
								edit_a.hide();
								save_a.show();
								cancel_a.show();
								that.editRow(content[id_filed]);
								$("#" + that._tableId + " >tfoot").find("button").each(function (i, ele) {
									$(ele).attr("class", "btn btn-xs btn-default");
								});
								e.stopPropagation();
							});
							cancel_a.click(function (e) {
								edit_a.show();
								save_a.hide();
								cancel_a.hide();
								that.cancelEditRow(content[id_filed]);
								$("#" + that._tableId + " >tfoot").find("button").each(function (i, ele) {
									$(ele).attr("class", "btn btn-xs btn-primary");
								});
								e.stopPropagation();
							});
							save_a.click(function (e) {
								data = that.getRowData(content[id_filed]);
								if (that._rowEditSaveHandle != undefined) {
									that._rowEditSaveHandle(index,content,data);
								}
								$("#" + that._tableId + " >tfoot").find("button").each(function (i, ele) {
									$(ele).attr("class", "btn btn-xs btn-primary");
								});
								e.stopPropagation();
							});
						}
					}
					if (that._showMoveTools) {
						var td = $('<td style="vertical-align:middle;text-align:center;"></td>');
						tr.append(td);
						var p = $('<p></p>');
						td.append(p);
						var upBtnCls = "btn-outline btn-primary";
						if (index == 0) {
							upBtnCls = "btn-default";
						}
						var downBtnCls = "btn-outline btn-primary";
						if (index == limit - 1) {
							downBtnCls = "btn-default";
						}
						var moveUp = $('<a title="上移" data-type="up-btn" class="btn btn-xs '+ upBtnCls+ '"><i class="fa fa-arrow-up"></i></a>');
						var moveDown = $('<a title="下移" data-type="down-btn" class="btn btn-xs '+ downBtnCls+ '"><i class="fa fa-arrow-down"></i></a>');
						p.append(moveUp);
						p.append(moveDown);
						$('#' + that._tableId + ' > thead').prepend(tr);
						moveUp.click(function (e) {
							if (that.$table.find("[data-param=true]").length > 0) {
								return false;
							}
							var seq = $(this).parents("tr").attr("data-seq");
							if (that._moveUpHandle) {
								var currentId = $(this).parents("tr").attr("data-id");
								var targetId = $(this).parents("tr").prev("tr").attr("data-id");
								if (targetId) {
									that._moveUpHandle(currentId,targetId,seq);
								}
							} else {
								console.error("未定义moveUpHandle");
							}
							// that.moveUp(seq);
							e.stopPropagation();
						});
						moveDown.click(function (e) {
							if (that.$table
								.find("[data-param=true]").length > 0) {
								return false;
							}
							var seq = $(this).parent()
								.parent().parent()
								.attr("data-seq");
							if (that._moveDownHandle) {
								var currentId = $(this).parents("tr").attr("data-id");
								var targetId = $(this).parents("tr").next("tr").attr("data-id");
								if (targetId) {
									that._moveDownHandle(currentId,targetId,seq);
								}
							} else {
								console.error("未定义moveDownHandle");
							}
							// that.moveDown(seq);
							e.stopPropagation();
						});
					}
					$('#' + that._tableId + ' > tbody').append(tr);
				});
			}
		},
		_renderTfoot : function () {
			var align = "right";
			if (this._bToolsAlign != undefined) {
				align = this._bToolsAlign;
			}
			this.$table.append('<tfoot></tfoot>');
			var tr = $('<tr></tr>');
			var td = $('<td style="text-align:' + align + ';" colspan=' + this._clospan + '></td>');
			tr.append(td);
			$('#' + this._tableId + ' > tfoot').append(tr);
			var col = $('<div class="col-sm-12 m-b-xs"></div>');
			$.each(this._bTools, function (index, content) {
				var icon = content.icon == undefined ? "" : "<i class=\"" + content.icon + "\"></i>";
				var button = $('<button type="button" class="btn btn-xs '
						 + (content.cls == undefined ? "btn-primary"
							 : content.cls) + '">' + content.text + ' '
						 + icon + '</button>');
				button.click(content.handle);
				col.append(button);
				//col.append('&nbsp;');
			});
			td.append(col);
		},
		// 渲染翻页组件
		_randerPaging : function () {
			var totalpage = this._getTotalPage();
			var pre_disabled = false;
			var next_disabled = false;
			if (this._pageNum == 1) {
				pre_disabled = true;
			}
			if (this._pageNum == totalpage) {
				next_disabled = true;
			}
			var page_tool_str = '<div id="'
				 + this._elementId
				 + '_page_tool" class="row"><div class="col-lg-12">'
				 + '<div id="'
				 + this._elementId
				 + '_page_info" class="col-sm-6"></div>'
				 + '<div class="col-sm-6">'
				 + '<div id="'
				 + this._elementId
				 + '_paginate" class="dataTables_paginate paging_simple_numbers">'
				 + '<ul class="pagination">'
				 + '<li id="'
				 + this._elementId
				 + '_page_pre" tabindex="0" aria-controls="DataTables_Table_0" class="paginate_button previous">'
				 + '<a href="javascript:void(0)">上一页</a>'
				 + '</li>'
				 + '<li id="'
				 + this._elementId
				 + '_page_next" tabindex="0" aria-controls="DataTables_Table_0" class="paginate_button next">'
				 + '<a href="javascript:void(0)">下一页</a>' + '</li>'
				 + '</ul>' + '</div>' + '</div>' + '</div></div>';
			this.$table.after(page_tool_str);
			$("#" + this._elementId + "_page_info").html(
				'第 <input id="' + this._elementId
				 + '_go" type="text" style="width:30px;" value="'
				 + this._pageNum + '">' + '页 共' + totalpage + '页 '
				 + '共' + this._data.total + '条数据');

			if (pre_disabled) {
				$("#" + this._elementId + "_page_pre").addClass("disabled");
				$("#" + this._elementId + "_page_pre").attr("disabled", true);
			}
			if (next_disabled) {
				$("#" + this._elementId + "_page_next").addClass("disabled");
				$("#" + this._elementId + "_page_next").attr("disabled", true)
			}
		},
		// 加载翻页事件
		_initPageEvent : function () {
			var that = this;
			$("#" + this._elementId + "_page_next").click(function (e) {
				if (!$(this).attr("disabled")) {
					that.nextPage();
				}
			});

			$("#" + this._elementId + "_page_pre").click(function (e) {
				if (!$(this).attr("disabled")) {
					that.prePage();
				}
			});

			$("#" + this._elementId + "_go").bind('input propertychange',
				function () {
				var num = $(this).val();
				if (num > 0 && num <= that._getTotalPage()) {
					that.goPage(num);
				}
			});

		},

		// 获取总页数
		_getTotalPage : function () {
			var totalpage = 0;
			var totalcount = this._data.total;
			var pagesize = this._pageSize;
			if (totalcount % pagesize != 0) {
				totalpage = Math.floor(totalcount / pagesize) + 1;
			} else {
				totalpage = Math.floor(totalcount / pagesize);
			}
			return totalpage;
		},
		// checkbox事件初始化
		_checkboxInit : function () {
			var that = this;
			$('input[data-title="' + that._elementId + '_checkbox_all"]').change(function (e) {
				var check = document.getElementById(that._elementId+ "_checkbox_all").checked;
				var checkboxs = document.getElementsByName(that._elementId+"_ids");
				for (var i = 0; i < checkboxs.length; i++) {
					checkboxs[i].checked = check;
				}
			});

			$('input[data-title="' + that._elementId + '_checkbox"]').change(function (e) {
				that._allCheck();
			});

			$('#' + that._tableId + ' > tbody > tr').click(function (e) {
				$(this).find('input[name="' + that._elementId + '_ids"]').trigger("click");
			});

			$('#' + that._tableId + ' > tbody > tr').find('input[name="' + that._elementId + '_ids"]').click(function (e) {
				e.stopPropagation();
			});
		},
		// 根据所有checkbox的选中情况判断头checkbox选中情况
		_allCheck : function () {
			var flag = false;
			var checkboxs = document
				.getElementsByName(this._elementId + "_ids");
			for (var i = 0; i < checkboxs.length; i++) {
				if (checkboxs[i].checked == false) {
					flag = true;
				}
			}
			if (flag) {
				document.getElementById(this._elementId + "_checkbox_all").checked = false;
			} else {
				document.getElementById(this._elementId + "_checkbox_all").checked = true;
			}
		},
		// 交换行（上交换下）
		_swapRow : function (from, to) {
			var fromRow = this.$table.find("tr[data-seq=" + from + "]");
			var temp = fromRow;
			var toRow = this.$table.find("tr[data-seq=" + to + "]");
			toRow.after(temp);
		},
		// 交换行（下交换上）
		_swapRowTop : function (from, to) {
			var fromRow = this.$table.find("tr[data-seq=" + from + "]");
			var temp = fromRow;
			var toRow = this.$table.find("tr[data-seq=" + to + "]");
			toRow.before(temp);
		},
		// 重新排序
		_reSeq : function () {
			var that = this;
			var limit = this.$table.find("tbody >tr").length;
			this.$table.find("tbody >tr").each(function (i) {
				$(this).attr("data-seq", i);
				var index = (that._pageNum - 1) * that._pageSize + i+ 1;
				$(this).find("td[data-type='index']").html(index);
				$(this).find("[data-type='up-btn']").attr("class","btn btn-xs btn-outline btn-primary");
				$(this).find("[data-type='down-btn']").attr("class","btn btn-xs btn-outline btn-primary");
				if (i == 0) {
					$(this).find("[data-type='up-btn']").attr("class","btn btn-xs btn-default");
				}
				if (i == limit - 1) {
					$(this).find("[data-type='down-btn']").attr("class", "btn btn-xs btn-default");
				}
			});
		},
		// 获取选中项当前排序号
		_getCurrentSeq : function () {
			var ids = this.currentCheckeds();
			if (ids.length > 0) {
				var id = ids[0];
				var seq = $("input[value=" + id + "]").parent().parent().attr("data-seq");
				return seq;
			} else {
				return null;
			}
		},
		_getCurrentSeqs : function () {
			var ids = this.currentCheckeds();
			var seqs = [];
			if (ids.length > 0) {
				for (var i in ids) {
					var seq = $("input[value=" + ids[i] + "]").parent().parent().attr("data-seq");
					seqs.push(seq);
				}
			}
			return seqs;
		},
		_addRow : function () {
			if (this.$table.find("tr[data-add=true]").length > 0) {
				return false;
			}
			if (this.$table.find("[data-param=true]").length > 0) {
				return false;
			}
			var that = this;
			var tr = $('<tr data-add=true></tr>')
				this.$table.find("tbody").append(tr);
			if (that._show_check == true) {
				tr.append("<td></td>");
			}
			if (that._showIndex == true) {
				tr.append("<td></td>");
			}
			$.each(this._cloums,function (index, content) {
				var td;
				if (content.edit == true) {
					td = $('<td style="text-align:center;vertical-align: middle;" data-id="'
							 + content[that._id_filed]
							 + ' data-name="'
							 + content.field
							 + '></td>');
					var ele;
					if (content.type == "input") {
						ele = $('<input style="width:90%;" data-add-input=true name="'
								 + content.filed
								 + '" type="text"/>');
						td.append(ele);
					} else if (content.type == "datepicker") {
						ele = $('<input style="width:90%;" data-add-input=true name="'
								 + content.filed
								 + '" type="text"/>');
						td.append(ele);
						var istime = false;
						if (content.isTime != undefined) {
							istime = content.isTime;
						}
						var dateFormat = "YYYY-MM-DD hh:mm:ss";
						if (content.dateFormat != undefined) {
							dateFormat = content.dateFormat;
						}
						var min = "";
						if (content.min != undefined) {
							min = "'" + content.min + "'";
						}
						var max = "";
						if (content.max != undefined) {
							max = "'" + content.max + "'";
						}
						var choose = function () {};
						if (content.choose) {
							choose = content.choose;
						}
						ele.click(function () {
							laydate({
								istime : istime,
								min : min,
								max : max,
								format : dateFormat,
								choose : function (data) {
									choose(data);
								}
							});
						});
					} else if (content.type == "select") {
						ele = $('<select style="width:90%;" data-add-input=true name="'+ content.filed+ '" ></select>');
						$.each(content.items,function (index, data) {
							var option = $('<option '
									 + (data.selected == true ? "selected=\"selected\"": "")
									 + ' value="'
									 + data.value
									 + '">'
									 + data.text
									 + '</option>');
							ele.append(option);
						});
						td.append(ele);
					} else if (content.type == "image") {
						ele = $('<a title="上传图片" href="javascript:;" class="btn btn-xs btn-outline btn-primary"><i class="fa fa-upload"></i></a>');
						ele.bind("click", function (e) {
							if (content.uploadHandle) {
								content.uploadHandle(td);
							}
						});
						td.append(ele);
					}
				} else {
					td = $('<td></td>');
				}
				tr.append(td);
			});
			if (this._actionCloums != undefined) {
				tr.append("<td></td>");
			}
			if (this._editRow != undefined) {
				var td = $('<td style="vertical-align:middle;text-align:center;"></td>');
				tr.append(td);
				var save_a = $('<a title="保存" class="btn btn-outline btn-primary btn-xs">保存</a>');
				var cancel_a = $('<a title="取消" class="btn btn-outline btn-primary btn-xs">取消</a>');
				td.append(save_a);
				td.append(cancel_a);
				cancel_a.click(function (e) {
					$(this).parent().parent().remove();
					e.stopPropagation();
				});
				save_a.click(function (e) {
					var data = "";
					var first = true;
					$(this).parent().parent().find("[data-add-input=true]").each(function () {
						if (first) {
							first = false;
							data += ("?" + $(this).attr("name")+ "=" + $(this).val());
						} else {
							data += ("&" + $(this).attr("name") + "=" + $(this).val());
						}
					});
					if (that._rowAddSaveHandle != undefined) {
						that._rowAddSaveHandle(data);
					}
					e.stopPropagation();
				});
			}
			if (this._showMoveTools != undefined && this._showMoveTools) {
				tr.append("<td></td>");
			}
		}
	};

	// 为jquery元素实例添加实例方法
	var grid = function (options) {
		options = $.extend({}, HwGrid.defaults, options);
		var eles = [];
		this.each(function () {
			var self = this;
			var grid = new HwGrid(self, options);
			eles.push(grid);
		});
		return eles[0];
	};

	var subString = function (value, limit) {
		if (value.length > limit) {
			value = value.substring(0, limit) + "...";
		}
		return value;
	};

	$.fn.extend({
		'HwGrid' : grid
	});
})(jQuery, window, document);
