;(function ( $, window, document, undefined ){
	//构造函数
	var HwMenu = function(element,options){
		//jquery元素变量
		this.$element = $(element);
		//js元素对象
		this._element = element;
		//id
		this._elementId = this._element.id;
		//菜单数据
		this._data = options.data;
		//选中菜单id
		this._activeId = options.activeId;
		//加载菜单路径
		this._ajax_url = options.url;
		//菜单默认图标
		this._default_icon_css = options.default_icon_css;

		if(this._data!=undefined){
			//初始化
			this._init();
		}else{
			//异步加载
			this._load();
		}
		
	};
	//默认构造参数
	HwMenu.defaults = {
		default_icon_css : "fa fa-folder",
		url : undefined,
		activeId : undefined,
		data : undefined,
		toggle: true,
        doubleTapToGo: false
	};
	//继承属性
	HwMenu.prototype = {
		//外部调用方法：重新加载菜单
		reload : function(url){
			this._ajax_url = url;
			this._refresh();
		},
		//外部调用方法：设置菜单选中
		activeMenu : function(id){
			this._clearActive();
			this._active(id);
		},
		//初始化
		_init : function(){
			//渲染菜单
			this._renderTopMenus();
			//选中当前导航菜单
			if(this._activeId!=undefined){
				this._active(this._activeId);
			}
			//通过遍历给菜单项加上data-index属性
			$(".J_menuItem").each(function (index) {
				if (!$(this).attr('data-index')) {
					$(this).attr('data-index', index);
				}
			});
			//初始化点击事件
			this._initEventLisener();
		},
		//异步加载菜单
		_load : function(){
			var that = this;
			$.ajax({
				type:"post",
				url:that._ajax_url,
				data:{},
				dataType:"json",
				async:false,
				cache:true,
				success: function(res){
					if (typeof res=="object"){
						that._data=res;
					}else{
						var json = eval("("+res+")");
						that._data = json;	
					}
					that._init();
				},
				error:function(i,s,n){
					console.log(s)
				}
			})					
		},
		//渲染顶级菜单
		_renderTopMenus : function(){
			var that = this;
			$.each(that._data,function(index,content){			
			if(content.pId==0){			
				var url = '',menuItem='';
				if(content.url!=''){
					menuItem='J_menuItem';
					url = content.url;
				}else{
					url="#"
				}
				var icon = '';
				if(content.icon!=undefined&&content.icon!=''){
					icon = content.icon;
				}else{
					icon = that._default_icon_css;
				}
				that.$element.append('<li date-remove="hw_menu" id="li_'+content.id+'" ><a  class="'+menuItem+'" data-id="'+content.id+'" id="a_'+content.id+'" href="'+url+'"><i class="'+icon+'"></i><span class="nav-label">'+content.name+'</span></a></li>');	
				that._renderSecondMenus(content.id);
			}
			
		});
		},
		//渲染二级菜单
		_renderSecondMenus : function(eleId){
			var that = this;
			$.each(that._data,function(index,content){
				if(content.pId==eleId){
					if($('#ul_'+eleId).length<=0){
						$('#a_'+eleId).append('<span class="fa arrow"></span>');
						$('#li_'+eleId).append('<ul id="ul_'+eleId+'" class="nav nav-second-level"></ul>');
					}
					var url = '',menuItem='';
					if(content.url!=''){
						menuItem='J_menuItem';
						url = content.url;
					}else{
						url="#"
					}
					var icon = '';
					if(content.icon!=undefined&&content.icon!=''){
						icon = content.icon;
					}else{
						icon = that._default_icon_css;
					}
					$('#ul_'+eleId).append('<li id="li_'+content.id+'" ><a class="'+menuItem+'"  data-id="'+content.id+'" id="a_'+content.id+'" href="'+url+'"><i class="'+icon+'"></i>'+content.name+'</a></li>');
					that._renderChildMenus(content.id);
				}
			});
		},
		//渲染三级和三级以上菜单
		_renderChildMenus: function(eleId){
			var that = this;
			$.each(that._data,function(index,content){
				if(content.pId==eleId){
					if($('#ul_'+eleId).length<=0){				
						$('#a_'+eleId).append('<span class="fa arrow"></span>');
						$('#li_'+eleId).append('<ul id="ul_'+eleId+'" class="nav nav-third-level"></ul>');					
					}
					var url = '',menuItem='';
					if(content.url!=''){
						menuItem='J_menuItem';
						url = content.url;
					}else{
						url="#"
					}
					var icon = '';
					if(content.icon!=undefined&&content.icon!=''){
						icon = content.icon;
					}else{
						icon = that._default_icon_css;
					}
					$('#ul_'+eleId).append('<li id="li_'+content.id+'" ><a class="'+menuItem+'" data-id="'+content.id+'"  id="a_'+content.id+'" href="'+url+'"><i class="'+icon+'"></i>'+content.name+'</a></li>');
					//调用自身递归
					that._renderChildMenus();
				}		
			});
		},
		//选中菜单
		_active : function(id){
			document.getElementById('li_'+id).setAttribute('className','active');	
			$('#li_'+id).addClass('active');	
			$('#li_'+id).parents('li').addClass('active');
		},
		//取消选中
		_clearActive : function(){
			this.$element.find('li').removeClass('active');
		},
		//初始事件
		_initEventLisener : function(){
			 var $this = this.$element,
                $toggle = this.toggle,
                obj = this;

            if (this.isIE() <= 9) {
                $this.find("li.active").has("ul").children("ul").collapse("show");
                $this.find("li").not(".active").has("ul").children("ul").collapse("hide");
            } else {
                $this.find("li.active").has("ul").children("ul").addClass("collapse in");
                $this.find("li").not(".active").has("ul").children("ul").addClass("collapse");
            }

            //add the "doubleTapToGo" class to active items if needed
            if (obj.doubleTapToGo) {
                $this.find("li.active").has("ul").children("a").addClass("doubleTapToGo");
            }

            $this.find("li").has("ul").children("a").on("click" , function(e) {
                e.preventDefault();

                //Do we need to enable the double tap
                if (obj.doubleTapToGo) {

                    //if we hit a second time on the link and the href is valid, navigate to that url
                    if (obj.doubleTapToGo($(this)) && $(this).attr("href") !== "#" && $(this).attr("href") !== "") {
                        e.stopPropagation();
                        //document.location = $(this).attr("href");
                        return;
                    }
                }

                $(this).parent("li").toggleClass("active").children("ul").collapse("toggle");

                if ($toggle) {
                    $(this).parent("li").siblings().removeClass("active").children("ul.in").collapse("hide");
                }

            });			
		},
		isIE: function() { //https://gist.github.com/padolsey/527683
            var undef,
                v = 3,
                div = document.createElement("div"),
                all = div.getElementsByTagName("i");

            while (
                div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->",
                    all[0]
                ) {
                return v > 4 ? v : undef;
            }
        },

        //Enable the link on the second click.
        doubleTapToGo: function(elem) {
            var $this = this.$element;

            //if the class "doubleTapToGo" exists, remove it and return
            if (elem.hasClass("doubleTapToGo")) {
                elem.removeClass("doubleTapToGo");
                return true;
            }

            //does not exists, add a new class and return false
            if (elem.parent().children("ul").length) {
                //first remove all other class
                $this.find(".doubleTapToGo").removeClass("doubleTapToGo");
                //add the class on the current element
                elem.addClass("doubleTapToGo");
                return false;
            }
        },
		//清除
		_remove : function(){
			$('li[date-remove="hw_menu"]').remove();
		},
		//刷新
		_refresh : function(){
			this._remove();
			this._init();
		}
	};
	
	//为jquery元素实例添加实例方法
	var menu = function(options){
		options = $.extend({}, HwMenu.defaults, options);
		var eles = [];
		this.each(function() {
			var self = this;
			var menus = new HwMenu(self,options);
			eles.push(menus);
		});
		return eles[0];		
	};
	$.fn.extend({
		'HwMenu':menu
	});
})(jQuery, window,document);
$(function () {
    //计算元素集合的总宽度
    function calSumWidth(elements) {
        var width = 0;
        $(elements).each(function () {
            width += $(this).outerWidth(true);
        });
        return width;
    }
    //滚动到指定选项卡
    function scrollToTab(element) {
        var marginLeftVal = calSumWidth($(element).prevAll()), marginRightVal = calSumWidth($(element).nextAll());
        // 可视区域非tab宽度
        var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".J_menuTabs"));
        //可视区域tab宽度
        var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
        //实际滚动宽度
        var scrollVal = 0;
        if ($(".page-tabs-content").outerWidth() < visibleWidth) {
            scrollVal = 0;
        } else if (marginRightVal <= (visibleWidth - $(element).outerWidth(true) - $(element).next().outerWidth(true))) {
            if ((visibleWidth - $(element).next().outerWidth(true)) > marginRightVal) {
                scrollVal = marginLeftVal;
                var tabElement = element;
                while ((scrollVal - $(tabElement).outerWidth()) > ($(".page-tabs-content").outerWidth() - visibleWidth)) {
                    scrollVal -= $(tabElement).prev().outerWidth();
                    tabElement = $(tabElement).prev();
                }
            }
        } else if (marginLeftVal > (visibleWidth - $(element).outerWidth(true) - $(element).prev().outerWidth(true))) {
            scrollVal = marginLeftVal - $(element).prev().outerWidth(true);
        }
        $('.page-tabs-content').animate({
            marginLeft: 0 - scrollVal + 'px'
        }, "fast");
    }
    //查看左侧隐藏的选项卡
    function scrollTabLeft() {
        var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
        // 可视区域非tab宽度
        var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".J_menuTabs"));
        //可视区域tab宽度
        var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
        //实际滚动宽度
        var scrollVal = 0;
        if ($(".page-tabs-content").width() < visibleWidth) {
            return false;
        } else {
            var tabElement = $(".J_menuTab:first");
            var offsetVal = 0;
            while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {//找到离当前tab最近的元素
                offsetVal += $(tabElement).outerWidth(true);
                tabElement = $(tabElement).next();
            }
            offsetVal = 0;
            if (calSumWidth($(tabElement).prevAll()) > visibleWidth) {
                while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
                    offsetVal += $(tabElement).outerWidth(true);
                    tabElement = $(tabElement).prev();
                }
                scrollVal = calSumWidth($(tabElement).prevAll());
            }
        }
        $('.page-tabs-content').animate({
            marginLeft: 0 - scrollVal + 'px'
        }, "fast");
    }
    //查看右侧隐藏的选项卡
    function scrollTabRight() {
        var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
        // 可视区域非tab宽度
        var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".J_menuTabs"));
        //可视区域tab宽度
        var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
        //实际滚动宽度
        var scrollVal = 0;
        if ($(".page-tabs-content").width() < visibleWidth) {
            return false;
        } else {
            var tabElement = $(".J_menuTab:first");
            var offsetVal = 0;
            while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {//找到离当前tab最近的元素
                offsetVal += $(tabElement).outerWidth(true);
                tabElement = $(tabElement).next();
            }
            offsetVal = 0;
            while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
                offsetVal += $(tabElement).outerWidth(true);
                tabElement = $(tabElement).next();
            }
            scrollVal = calSumWidth($(tabElement).prevAll());
            if (scrollVal > 0) {
                $('.page-tabs-content').animate({
                    marginLeft: 0 - scrollVal + 'px'
                }, "fast");
            }
        }
    }

    

    function menuItem(e) {
		e.preventDefault();
        // 获取标识数据
        var dataUrl = $(this).attr('href'),
            dataIndex = $(this).data('index'),
            menuName = $.trim($(this).text()),
            flag = true;
        if (dataUrl == undefined || $.trim(dataUrl).length == 0 || dataUrl=='#' || dataUrl=="null")return false;

        // 选项卡菜单已存在
        $('.J_menuTab').each(function () {
            if ($(this).data('id') == dataUrl) {
                if (!$(this).hasClass('active')) {
                    $(this).addClass('active').siblings('.J_menuTab').removeClass('active');
                    scrollToTab(this);
                    // 显示tab对应的内容区
                    $('.J_mainContent .J_iframe').each(function () {
                        if ($(this).data('id') == dataUrl) {
                            $(this).show().siblings('.J_iframe').hide();
                            return false;
                        }
                    });
                }
                flag = false;
                return false;
            }
        });

        // 选项卡菜单不存在
        if (flag) {
            var str = '<a href="javascript:;" class="active J_menuTab" data-id="' + dataUrl + '">' + menuName + ' <i class="fa fa-times-circle"></i></a>';
            $('.J_menuTab').removeClass('active');

            // 添加选项卡对应的iframe
            var str1 = '<iframe class="J_iframe" name="iframe' + dataIndex + '" width="100%" height="100%" src="' + dataUrl + '" frameborder="0" data-id="' + dataUrl + '" seamless></iframe>';
            $('.J_mainContent').find('iframe.J_iframe').hide().parents('.J_mainContent').append(str1);

            // 添加选项卡
            $('.J_menuTabs .page-tabs-content').append(str);
            scrollToTab($('.J_menuTab.active'));
        }
        return false;
    }

	$(document).on("click",".J_menuItem",menuItem)

    // 关闭选项卡菜单
    function closeTab() {
        var closeTabId = $(this).parents('.J_menuTab').data('id');
        var currentWidth = $(this).parents('.J_menuTab').width();

        // 当前元素处于活动状态
        if ($(this).parents('.J_menuTab').hasClass('active')) {

            // 当前元素后面有同辈元素，使后面的一个元素处于活动状态
            if ($(this).parents('.J_menuTab').next('.J_menuTab').size()) {

                var activeId = $(this).parents('.J_menuTab').next('.J_menuTab:eq(0)').data('id');
                $(this).parents('.J_menuTab').next('.J_menuTab:eq(0)').addClass('active');

                $('.J_mainContent .J_iframe').each(function () {
                    if ($(this).data('id') == activeId) {
                        $(this).show().siblings('.J_iframe').hide();
                        return false;
                    }
                });

                var marginLeftVal = parseInt($('.page-tabs-content').css('margin-left'));
                if (marginLeftVal < 0) {
                    $('.page-tabs-content').animate({
                        marginLeft: (marginLeftVal + currentWidth) + 'px'
                    }, "fast");
                }

                //  移除当前选项卡
                $(this).parents('.J_menuTab').remove();

                // 移除tab对应的内容区
                $('.J_mainContent .J_iframe').each(function () {
                    if ($(this).data('id') == closeTabId) {
                        $(this).remove();
                        return false;
                    }
                });
            }

            // 当前元素后面没有同辈元素，使当前元素的上一个元素处于活动状态
            if ($(this).parents('.J_menuTab').prev('.J_menuTab').size()) {
                var activeId = $(this).parents('.J_menuTab').prev('.J_menuTab:last').data('id');
                $(this).parents('.J_menuTab').prev('.J_menuTab:last').addClass('active');
                $('.J_mainContent .J_iframe').each(function () {
                    if ($(this).data('id') == activeId) {
                        $(this).show().siblings('.J_iframe').hide();
                        return false;
                    }
                });

                //  移除当前选项卡
                $(this).parents('.J_menuTab').remove();

                // 移除tab对应的内容区
                $('.J_mainContent .J_iframe').each(function () {
                    if ($(this).data('id') == closeTabId) {
                        $(this).remove();
                        return false;
                    }
                });
            }
        }
        // 当前元素不处于活动状态
        else {
            //  移除当前选项卡
            $(this).parents('.J_menuTab').remove();

            // 移除相应tab对应的内容区
            $('.J_mainContent .J_iframe').each(function () {
                if ($(this).data('id') == closeTabId) {
                    $(this).remove();
                    return false;
                }
            });
            scrollToTab($('.J_menuTab.active'));
        }
        return false;
    }

    $(document).on('click', '.J_menuTab i', closeTab);

    //关闭其他选项卡
    function closeOtherTabs(){
        $('.page-tabs-content').children("[data-id]").not(":first").not(".active").each(function () {
            $('.J_iframe[data-id="' + $(this).data('id') + '"]').remove();
            $(this).remove();
        });
        $('.page-tabs-content').css("margin-left", "0");
    }
    $('.J_tabCloseOther').on('click', closeOtherTabs);

    //滚动到已激活的选项卡
    function showActiveTab(){
        scrollToTab($('.J_menuTab.active'));
    }
    $(document).on('click' ,'.J_tabShowActive', showActiveTab);


    // 点击选项卡菜单
    function activeTab() {
        if (!$(this).hasClass('active')) {
            var currentId = $(this).data('id');
            // 显示tab对应的内容区
            $('.J_mainContent .J_iframe').each(function () {
                if ($(this).data('id') == currentId) {
                    $(this).show().siblings('.J_iframe').hide();
                    return false;
                }
            });
            $(this).addClass('active').siblings('.J_menuTab').removeClass('active');
            scrollToTab(this);
        }
    }

    $(document).on('click', '.J_menuTab', activeTab);

    //刷新iframe
    function refreshTab() {
        var target = $('.J_iframe[data-id="' + $(this).data('id') + '"]');
        var url = target.attr('src');
    }

    $(document).on('dblclick', '.J_menuTab', refreshTab);

    // 左移按扭
    $(document).on('click','.J_tabLeft', scrollTabLeft);

    // 右移按扭
    $(document).on('click','.J_tabRight', scrollTabRight);

    // 关闭全部
    $(document).on('click','.J_tabCloseAll', function () {
        $('.page-tabs-content').children("[data-id]").not(":first").each(function () {
            $('.J_iframe[data-id="' + $(this).data('id') + '"]').remove();
            $(this).remove();
        });
        $('.page-tabs-content').children("[data-id]:first").each(function () {
            $('.J_iframe[data-id="' + $(this).data('id') + '"]').show();
            $(this).addClass("active");
        });
        $('.page-tabs-content').css("margin-left", "0");
    });

});