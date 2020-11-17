var ns;
var app = new Vue({
    el: '#app',
    data: {
        hideeditbtn: false,
        list: [],
        form: {
            OrderTypeID: 20,
            totalcount: 0,
            keywords: '',
            pageindex: 1,
            pagesize: 10,
            current_item_length: 0,
            is_searching: false,
            scroll_top: 0,
            can_scroll: false,
            source: 'zclytklist',
        },
        searchform: {
            StartTime: '',
            EndTime: ''
        }
    },
    methods: {
        do_select_tab: function(type) {
            var that = this;
            that.form.OrderTypeID = type;
            that.get_data();
        },
        get_data: function() {
            var that = this;
            if (!ns.AllowAuth('ZCGLORDER')) {
                that.hideeditbtn = true;
            }
            that.form.can_scroll = false;
            ns.post({
                action: 'APP_GETORDERLIST',
                p: that.form.pageindex,
                pagecount: that.form.pagesize,
                searchstr: that.form.keywords,
                OrderTypeID: that.form.OrderTypeID,
                fromdate: that.searchform.StartTime,
                todate: that.searchform.EndTime
            }, function(succeed, data, err) {
                if (succeed) {
                    if (that.form.pageindex == 1) {
                        that.list = data.list;
                    } else {
                        that.list = that.list.concat(data.list);
                    }
                    that.form.totalcount = data.total;
                    if (that.list.length < that.form.totalcount) {
                        that.form.can_scroll = true;
                    }
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_search_keywords: function() {
            var that = this;
            var title = '搜索';
            var name = 'zcsearch_frm';
            ns.openWin(name, title, {
                source: that.form.source
            });
        },
        do_search: function() {
            var that = this;
            var name = 'weixiusearchbar_frm';
            var url = 'weixiusearchbar_frm.html';
            var x = 0;
            var y = ns.getPageParam('header_h') + 35;
            var w = api.winWidth;
            var h = api.winHeight - y;
            ns.openFrame(name, url, {
                type: 'movein',
                subType: 'from_right',
                x: x,
                y: y,
                h: h,
                w: w
            }, {
                source: that.form.source,
                StartTime: that.searchform.StartTime,
                EndTime: that.searchform.EndTime,
            });
        },
        pull_refresh_init: function() {
            var that = this;
            var pullRefresh = new auiPullToRefresh({
                container: document.querySelector('.aui-refresh-content'),
                triggerDistance: 100
            }, function(ret) {
                if (ret.status == "success") {
                    setTimeout(function() {
                        that.form.pageindex = 1;
                        app.form.keywords = '';
                        that.get_data();
                        pullRefresh.cancelLoading(); //刷新成功后调用此方法隐藏
                    }, 1500)
                }
            })
            var scroll = new auiScroll({
                listen: true,
                distance: 0 //判断到达底部的距离，isToBottom为true
            }, function(ret) {
                if (ret.isToBottom && that.form.can_scroll) {
                    if (that.form.scroll_top > ret.scrollTop) {
                        that.form.scroll_top = ret.scrollTop;
                        return;
                    }
                    that.form.scroll_top = ret.scrollTop + 1;
                    that.form.pageindex++;
                    that.get_data();
                }
            });
        },
        do_add_item: function(id, ordertypeid) {
            var title = '';
            var name = '';
            var canlingyong = false;
            var cantuiku = false;
            if (ordertypeid == 10) {
                title = '资产退库';
                name = 'zctuiku_frm';
                cantuiku = id > 0 ? false : true;
            } else {
                title = '资产领用';
                name = 'zclingyong_frm';
                canlingyong = id > 0 ? false : true;
            }
            var canedit = id > 0 ? false : true;
            ns.openWin(name, title, {
                canedit: canedit,
                hideeditbtn: true,
                canlingyong: canlingyong,
                cantuiku: cantuiku,
                id: id,
            });
        },
        do_open_operation: function() {
            var that = this;
            var name = 'zclytklistbtn_frm';
            var url = 'zclytklistbtn_frm.html';
            ns.openFrame(name, url, {
                type: 'push'
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.keywords = ns.getPageParam('keywords') || '';
    app.form.OrderTypeIDs = ns.getPageParam('OrderTypeIDs') || '10,20';
    app.hideeditbtn = ns.getPageParam('hideeditbtn') || false;
    app.pull_refresh_init();
    setTimeout(function() {
        app.form.pageindex = 1;
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_start_lingyong'
    }, function() {
        app.do_add_item(0, 20);
    });
    api.addEventListener({
        name: 'do_start_tuiku'
    }, function() {
        app.do_add_item(0, 10);
    });
    api.addEventListener({
        name: 'do_search_complete'
    }, function(ret) {
        if (ret.source == that.form.source) {
            if (ret.value && ret.value.keywords) {
                app.form.keywords = ret.value.keywords;
                app.form.pageindex = 1;
                app.get_data();
            }
        }
    });
    api.addEventListener({
        name: 'do_reload_lingyong_list'
    }, function(ret) {
        app.form.OrderTypeID = 20;
        app.get_data();
    });
    api.addEventListener({
        name: 'do_reload_tuiku_list'
    }, function(ret) {
        app.form.OrderTypeID = 10;
        app.get_data();
    });
    api.addEventListener({
        name: 'do_weixiusearchbar_complete'
    }, function(ret) {
        if (ret.value.source == app.form.source) {
            if (ret.value) {
                app.searchform.StartTime = ret.value.StartTime;
                app.searchform.EndTime = ret.value.EndTime;
            }
            app.form.pageindex = 1;
            app.get_data();
        }
    });
}
