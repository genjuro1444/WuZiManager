var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        form: {
            pageindex: 1,
            pagesize: 10,
            tabtype: 1
        },
        current_item_length: 0,
        is_searching: false,
        scroll_top: 0,
        can_scroll: true
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            that.can_scroll = false;
            var options = {};
            options.p = that.form.pageindex;
            options.pagecount = that.form.pagesize;
            options.action = 'APP_GETMESSAGELIST_PAGE';
            options.msgtype = that.form.tabtype;
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    if (data.list.length == that.form.pagesize) {
                        that.can_scroll = true;
                    }
                    if (that.form.pageindex == 1) {
                        that.list = data.list;
                    } else {
                        that.list = that.list.concat(data.list);
                    }
                    app.current_item_length = that.list.length;
                } else if (err) {
                    that.list = [];
                    that.current_item_length = 0;
                    api.toast({
                        msg: err,
                        duration: 20000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: true
            });
        },
        do_select_tab: function(type) {
            var that = this;
            that.form.tabtype = type;
            that.get_data();
        },
        open_win: function(item) {
            var that = this;
            for (var i = 0; i < that.list.length; i++) {
                if (that.list[i].ID == item.ID) {
                    that.list[i].IsRead = 1;
                    break;
                }
            }
            var name = 'messagedetail_frm';
            var title = "查看消息";
            ID = item.ID;
            if (that.form.tabtype == 2) {
                name = 'messageadd_frm';
            }
            ns.openWin(name, title, {
                id: ID
            });
        },
        do_add: function() {
            var that = this;
            ns.openWin('messageadd_frm', '发布消息');
        },
        convertcss: function(lb) {
            if (lb == '通知')
                return "";
            else
                return "gonggao"
        },
        covertdate: function(date) {
            var currdate = new Date(date);
            var year = currdate.getFullYear(); //获取完整的年份(4位,1970-????)
            var month = currdate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
            var day = currdate.getDate(); //获取当前日(1-31)
            if (month < 10) {
                month = "0" + month;
            }
            if (day < 10) {
                day = "0" + day;
            }
            var dateString = year + "-" + month + "-" + day;
            return dateString;
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.get_data();
    var pullRefresh = new auiPullToRefresh({
        container: document.querySelector('.aui-refresh-content'),
        triggerDistance: 100
    }, function(ret) {
        if (ret.status == "success") {
            setTimeout(function() {
                app.form.pageindex = 1;
                app.get_data();
                pullRefresh.cancelLoading(); //刷新成功后调用此方法隐藏
            }, 1500)
        }
    })
    var scroll = new auiScroll({
        listen: true,
        distance: 0 //判断到达底部的距离，isToBottom为true
    }, function(ret) {
        if (ret.isToBottom && app.can_scroll) {
            if (app.scroll_top > ret.scrollTop) {
                app.scroll_top = ret.scrollTop;
                return;
            }
            app.scroll_top = ret.scrollTop + 1;
            app.form.pageindex ++;
            app.get_data();
        }
    });
    api.addEventListener({
        name: 'do_reload_messagelist'
    }, function() {
        setTimeout(function() {
            app.get_data();
        }, 500)
    });
    api.addEventListener({
        name: 'do_open_add_message'
    }, function() {
        app.do_add();
    });
    api.addEventListener({
        name: 'onlogin'
    }, function() {
        app.get_data();
    });
};
