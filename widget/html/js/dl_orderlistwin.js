var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            status: 0,
            tabIndex: -1
        }
    },
    methods: {
        randomSwitchBtn: function(name, index) {
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
        },
        open_frame_group: function() {
            var that = this;
            var top_tab = 　$api.byId('tab')
            var body_h = api.winHeight;
            var top_tab_h = $api.offset(top_tab).h;
            var header_h = api.pageParam.header_h;
            var framename = 'dl_orderlist_frm';
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
                    name: framename,
                    url: framename + '.html',
                    bounces: false,
                    pageParam: {
                        status: 0
                    }
                }, {
                    name: framename,
                    url: framename + '.html',
                    bounces: false,
                    pageParam: {
                        status: 1
                    }
                }, {
                    name: framename,
                    url: framename + '.html',
                    bounces: false,
                    pageParam: {
                        status: 5
                    }
                }, {
                    name: framename,
                    url: framename + '.html',
                    bounces: false,
                    pageParam: {
                        status: 2 //待收货
                    }
                }, {
                    name: framename,
                    url: framename + '.html',
                    bounces: false,
                    pageParam: {
                        status: 3 //已完成
                    }
                }, {
                    name: framename,
                    url: framename + '.html',
                    bounces: false,
                    pageParam: {
                        status: 6 //退款中
                    }
                }, {
                    name: framename,
                    url: framename + '.html',
                    bounces: false,
                    pageParam: {
                        status: 10 //退款失败
                    }
                }, {
                    name: framename,
                    url: framename + '.html',
                    bounces: false,
                    pageParam: {
                        status: 4 //已关闭退款
                    }
                }]
            }, function(ret, err) {
                if (app.form.tabIndex >= 0) {
                    that.randomSwitchBtn('', app.form.tabIndex);
                    app.form.tabIndex = -1;
                } else {
                    var top_tab = $api.byId('tab');
                    var tabAct = $api.dom(top_tab, '.aui-tab-item.aui-active');
                    $api.removeCls(tabAct, 'aui-active');
                    var name = ret.name;
                    var index = ret.index;
                    $api.addCls($api.byId('tabbar' + index), 'aui-active');
                }
            })
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.status = api.pageParam.status || 0;
    app.form.tabIndex = api.pageParam.tabIndex || -1;
    app.open_frame_group();
}
