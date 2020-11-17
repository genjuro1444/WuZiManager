var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            nottakecount: 0,
            notusecount: 0,
            usedcount: 0,
            expiredcount: 0
        },
        type: 0
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getmycouponcounts',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form = data;
                    return;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        randomSwitchBtn: function(name, index) {
            var that = this;
            that.get_data();
            var top_tab = $api.byId('tab');
            var topAct = $api.dom(top_tab, '.aui-tab-item.aui-active');
            $api.removeCls(topAct, 'aui-active');
            var obj = $api.byId('tabbar' + index);
            $api.addCls(obj, 'aui-active');
            api.setFrameGroupIndex({
                name: 'top_tab_switch',
                index: index,
                scroll: true
            });
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.type = api.pageParam.type || 0;
    if (app.type == 24) {
        setTimeout(function() {
            app.randomSwitchBtn('未使用', 1);
        }, 200)
    }
    app.get_data();
    var top_tab = 　$api.byId('tab')
    var body_h = api.winHeight;
    var top_tab_h = $api.offset(top_tab).h;
    var header_h = api.pageParam.header_h;
    var status = api.pageParam.status;
    api.addEventListener({
        name: 're_get_coupon_list'
    }, function() {
        app.get_data();
    });
    var frameName = 'dl_mycouponlist_frm'
    api.openFrameGroup({
        name: 'top_tab_switch',
        scrollEnabled: true,
        rect: {
            x: 0,
            y: top_tab_h + header_h,
            w: 'auto',
            h: body_h - top_tab_h - header_h
        },
        index: 0,
        preload: 0,
        frames: [{
            name: frameName,
            url: frameName + '.html',
            bounces: false,
            pageParam: {
                status: 0
            }
        }, {
            name: frameName,
            url: frameName + '.html',
            bounces: false,
            pageParam: {
                status: 1
            }
        }, {
            name: frameName,
            url: frameName + '.html',
            bounces: false,
            pageParam: {
                status: 2
            }
        }, {
            name: frameName,
            url: frameName + '.html',
            bounces: false,
            pageParam: {
                status: 3
            }
        }]
    }, function(ret, err) {
        var top_tab = $api.byId('tab');
        var tabAct = $api.dom(top_tab, '.aui-tab-item.aui-active');
        $api.removeCls(tabAct, 'aui-active');

        var name = ret.name;
        var index = ret.index;
        $api.addCls($api.byId('tabbar' + index), 'aui-active');
    })
}
