var ns;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        form: {
            OrderTypeID: 10,
            totalcount: 0,
            keywords: '',
            pageindex: 1,
            pagesize: 10,
            current_item_length: 0,
            is_searching: false,
            scroll_top: 0,
            can_scroll: false,
            source: 'zctuikulist'
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
                OrderTypeID: that.form.OrderTypeID
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
            }, { toast: true });
        },
        do_search: function() {
            var that = this;
            var title = '搜索';
            var name = 'zcsearch_frm';
            ns.openWin(name, title, { source: that.form.source });
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
        do_add_tuiku: function(id) {
            var title = id > 0 ? '资产退库' : '资产退库';
            var name = 'zctuiku_frm';
            var cansave = id > 0 ? false : true;
            var canedit = id > 0 ? false : true;
            var hideeditbtn = id > 0 ? false : true;
            ns.openWin(name, title, { canedit: canedit, cantuiku: cansave, id: id, hideeditbtn: hideeditbtn });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.keywords = ns.getPageParam('keywords') || '';
    app.pull_refresh_init();
    setTimeout(function() {
        app.form.pageindex = 1;
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_open_add_tuiku'
    }, function() {
        app.do_add_tuiku(0);
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
        name: 'do_reload_tuiku_list'
    }, function(ret) {
        app.get_data();
    });
}