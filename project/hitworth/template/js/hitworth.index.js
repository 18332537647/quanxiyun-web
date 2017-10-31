//自定义js
$(function(){
	var navigation='<div class="nav-close"><i class="fa fa-times-circle"></i></div>'+
            '<div class="sidebar-collapse">'+
                '<ul class="nav" id="side-menu">'+
                    '<li class="nav-header">'+
                        '<div class="dropdown profile-element">'+
                            '<span><img alt="image" class="img-circle" src="hitworth/img/profile_small.jpg" /></span>'+
                            '<a data-toggle="dropdown" class="dropdown-toggle" href="#">'+
                                '<span class="clear">'+
                               '<span class="block m-t-xs"><strong class="font-bold">Beaut-zihan</strong></span>'+
                                '<span class="text-muted text-xs block">超级管理员<b class="caret"></b></span>'+
                                '</span>'+
                            '</a>'+
                            '<ul class="dropdown-menu animated fadeInRight m-t-xs">'+
                                '<li><a class="J_menuItem" href="form_avatar.html">修改头像</a>'+
                                '</li>'+
                            '</ul>'+
                        '</div>'+
                        '<div class="logo-element">翰维</div>'+
                    '</li>'+
                '</ul>'+
            '</div>';
	var rightcont='<div class="row border-bottom">'+
                '<nav class="navbar navbar-static-top clearfix" role="navigation">'+
                    '<div class="navbar-header"><a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="#"><i class="fa fa-bars"></i> </a></div>'+
                	'<ul class="nav navbar-top-links navbar-right lh-60 clearfix"><li>' +
						'<span class="m-r-sm text-muted welcome-message">'+
						'<i class="fa fa-home"></i>'+
						'欢迎使用翰维科技后台主题</span>'+
					'</li></ul>'+
				'</nav>'+
            '</div>'+
            '<div class="row content-tabs">'+
                '<button class="roll-nav roll-left J_tabLeft"><i class="fa fa-backward"></i>'+
                '</button>'+
                '<nav class="page-tabs J_menuTabs">'+
                    '<div class="page-tabs-content">'+
                        '<a href="javascript:;" class="active J_menuTab" data-id="welcome.html">首页</a>'+
                    '</div>'+
                '</nav>'+
                '<button class="roll-nav roll-right J_tabRight"><i class="fa fa-forward"></i>'+
                '</button>'+
                '<div class="btn-group roll-nav roll-right">'+
                    '<button class="dropdown J_tabClose" data-toggle="dropdown">关闭操作<span class="caret"></span>'+
                    '</button>'+
                    '<ul role="menu" class="dropdown-menu dropdown-menu-right">'+
                        '<li class="J_tabShowActive"><a>定位当前选项卡</a>'+
                        '</li>'+
                        '<li class="divider"></li>'+
                        '<li class="J_tabCloseAll"><a>关闭全部选项卡</a>'+
                        '</li>'+
                        '<li class="J_tabCloseOther"><a>关闭其他选项卡</a>'+
                        '</li>'+
                    '</ul>'+
                '</div>'+
                '<a href="login.html" class="roll-nav roll-right J_tabExit"><i class="fa fa fa-sign-out"></i> 退出</a>'+
            '</div>'+
            '<div class="row J_mainContent" id="content-main">'+
                '<iframe class="J_iframe" name="iframe0" width="100%" height="100%" src="hitworth/welcome.html" frameborder="0" data-id="welcome.html" seamless></iframe>'+
           '</div>'+
            '<div class="footer">'+
                '<div class="pull-right">©2016 <a href="" target="_blank">北京翰维科技发展有限公司</a> 版权所有  京ICP备14039590号</div>'+
            '</div>';
			
			$("#left-menu").append(navigation);
			$("#page-wrapper").append(rightcont);
});
//公共配置

$(document).ready(function () {
    //固定菜单栏
    $(function () {
        $('.sidebar-collapse').slimScroll({
            height: '100%',
            railOpacity: 0.9,
            alwaysVisible: false
        });
    });


    // 菜单切换
    $('.navbar-minimalize').click(function () {
        $("body").toggleClass("mini-navbar");
        SmoothlyMenu();
    });


    // 侧边栏高度
    function fix_height() {
        var heightWithoutNavbar = $("body > #wrapper").height() - 61;
        $(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");
    }
    fix_height();

    $(window).bind("load resize click scroll", function () {
        if (!$("body").hasClass('body-small')) {
            fix_height();
        }
    });

    //侧边栏滚动
    $(window).scroll(function () {
        if ($(window).scrollTop() > 0 && !$('body').hasClass('fixed-nav')) {
            $('#right-sidebar').addClass('sidebar-top');
        } else {
            $('#right-sidebar').removeClass('sidebar-top');
        }
    });

    $('.full-height-scroll').slimScroll({
        height: '100%'
    });

    $('#side-menu>li').click(function () {
        if ($('body').hasClass('mini-navbar')) {
            NavToggle();
        }
    });
    $('#side-menu>li li a').click(function () {
        if ($(window).width() < 769) {
            NavToggle();
        }
    });

    $('.nav-close').click(NavToggle);

    //ios浏览器兼容性处理
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
        $('#content-main').css('overflow-y', 'auto');
    }

});

$(window).bind("load resize", function () {
    if ($(this).width() < 769) {
        $('body').addClass('mini-navbar');
        $('.navbar-static-side').fadeIn();
    }
});

function NavToggle() {
    $('.navbar-minimalize').trigger('click');
}

function SmoothlyMenu() {
    if (!$('body').hasClass('mini-navbar')) {
        $('#side-menu').hide();
        setTimeout(
            function () {
                $('#side-menu').fadeIn(500);
            }, 100);
    } else if ($('body').hasClass('fixed-sidebar')) {
        $('#side-menu').hide();
        setTimeout(
            function () {
                $('#side-menu').fadeIn(500);
            }, 300);
    } else {
        $('#side-menu').removeAttr('style');
    }
}
