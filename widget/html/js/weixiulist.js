var ns;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        form: {
            OrderTypeID: 60,
            totalcount: 0,
            keywords: '',
            pageindex: 1,
            pagesize: 10,
            current_item_length: 0,
            is_searching: false,
            scroll_top: 0,
            can_scroll: false,
            source: 'weixiulist'
        },
        searchform: {
            StartTime: '',
            EndTime: '',
            RepairStatus: 0
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            that.form.can_scroll = false;
            ns.post({
                action: 'APP_GETORDERLIST',
                p: that.form.pageindex,
                pagecount: that.form.pagesize,
                searchstr: that.form.keywords,
                OrderTypeID: that.form.OrderTypeID,
                fromdate: that.searchform.StartTime,
                todate: that.searchform.EndTime,
                completed: that.searchform.RepairStatus
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
        do_search: function() {
            var that = this;
            var name = 'weixiusearchbar_frm';
            var url = 'weixiusearchbar_frm.html';
            var x = 0;
            var y = ns.getPageParam('header_h') || 25;
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
                RepairStatus: that.searchform.RepairStatus,
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
        do_add_weixiu: function(id) {
            var title = id > 0 ? '维修单' : '新增维修单';
            var name = 'weixiuedit_frm';
            var cansave = id > 0 ? false : true;
            var canedit = id > 0 ? false : true;
            var hideeditbtn = id > 0 ? false : true;
            ns.openWin(name, title, {
                canedit: canedit,
                cansaveweixiu: cansave,
                id: id,
                hideeditbtn: hideeditbtn
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.keywords = ns.getPageParam('keywords') || '';
    app.form.OrderTypeID = ns.getPageParam('OrderTypeID') || 60;
    app.pull_refresh_init();
    setTimeout(function() {
        app.form.pageindex = 1;
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_open_add_weixiu'
    }, function() {
        app.do_add_weixiu(0);
    });
    api.addEventListener({
        name: 'do_reload_weixiu_list'
    }, function(ret) {
        app.get_data();
    });
    api.addEventListener({
        name: 'do_open_searchwx'
    }, function() {
        app.do_search_keywords();
    });
    api.addEventListener({
        name: 'do_search_complete'
    }, function(ret) {
        if (ret.value.source == app.form.source) {
            if (ret.value && ret.value.keywords) {
                app.form.keywords = ret.value.keywords;
                app.form.pageindex = 1;
                app.get_data();
            }
        }
    });
    api.addEventListener({
        name: 'do_weixiusearchbar_complete'
    }, function(ret) {
        if (ret.value.source == app.form.source) {
            if (ret.value) {
                app.searchform.StartTime = ret.value.StartTime;
                app.searchform.EndTime = ret.value.EndTime;
                app.searchform.RepairStatus = ret.value.RepairStatus;
            }
            app.form.pageindex = 1;
            app.get_data();
        }
    });
}
