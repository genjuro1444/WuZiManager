var header_h, NVTabBar, ajpush, ns, app, UIActionProgress;
var trycount = 0;
app = new Vue({
    el: '#app',
    data: {
        footer_menus: [{
            index: 1,
            css: 'iconapplication',
            title: '资产管理',
            url: 'homezichan_frm',
            ActiveCss: 'aui-active',
            total: 0
        }, {
            index: 2,
            css: 'iconxiaoxi1',
            title: '消息',
            url: 'homemessage_frm',
            ActiveCss: '',
            total: 0
        }, {
            index: 3,
            css: 'iconwode',
            title: '我的',
            url: 'homeself_frm',
            ActiveCss: '',
            total: 0
        }],
        page_title: '资产管理',
        show_myself: false,
        frameH: 0,
        headerH: 0,
        footerH: 0,
        show_add_message: false
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'APP_GETUNREADMESSAGECOUNT',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.footer_menus[1].total = data.total;
                } else if (err) {
                    ns.toast(err);
                }
            });
        },
        openMenuFrame: function(item) {
            var that = this;
            for (var i = 0; i < that.footer_menus.length; i++) {
                var menu = that.footer_menus[i];
                menu.ActiveCss = '';
                if (item.index == menu.index) {
                    menu.ActiveCss = 'aui-active';
                    that.page_title = menu.title;
                }
            }
            var y = that.headerH;
            var h = that.frameH - that.footerH - that.headerH;
            if (item.index == 2) {
                that.show_add_message = true;
            } else {
                that.show_add_message = false;
            }
            ns.openFrame(item.url, './html/' + item.url + '.html', {
                y: y,
                h: h
            });
        },
        set_status_bar: function() {
            var that = this;
            if (api.systemType != 'ios') {
                api.setStatusBarStyle({
                    color: '#000',
                });
            } else {
                api.setStatusBarStyle({
                    style: 'dark'
                });
            }
        },
        do_open_add_message: function() {
            api.sendEvent({
                name: 'do_open_add_message'
            });
        }
    }
});
apiready = function() {
    app.set_status_bar();
    api.parseTapmode();
    ns = window.Foresight.Util;
    UIActionProgress = api.require('UIActionProgress');
    app.frameH = api.winHeight;
    var header = $api.byId('aui-header');
    // $api.fixStatusBar(header);
    var statusBar = api.require('statusBar');
    var statusBarHeight = statusBar.getStatusBarHeight();
    if (statusBarHeight > 25) {
        $api.css(header, 'border-top: solid ' + statusBarHeight + 'px #000;');
    }
    app.headerH = $api.offset(header).h;
    var footer = $api.byId('footer');
    // $api.fixStatusBar(footer);
    app.footerH = $api.offset(footer).h;
    app.openMenuFrame(app.footer_menus[0]);
    api.addEventListener({
        name: 'resume'
    }, function(ret, err) {
        app.get_data();
    });
    api.addEventListener({
        name: 'getmessagecount'
    }, function(ret, err) {
        app.get_data();
    });
    setTimeout(function() {
        appupgrade.check_upgrade(false);
    }, 5000)
    app.get_data();
    var last_out_time;
    api.addEventListener({
        name: 'keyback'
    }, function(ret, err) {
        if (last_out_time && last_out_time.valueOf() >= (new Date().valueOf() - 1000)) {
            api.closeWidget({
                silent: true
            });
            return;
        }
        last_out_time = new Date();
        api.toast({
            msg: '再按一次退出程序',
            duration: 1000
        });
    });
};
