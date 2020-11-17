var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        form: {
            pageindex: 0,
            pagesize: 10,
        },
        current_item_length: 0,
        is_searching: false,
        scroll_top: 0,
        can_scroll: true,
        haslist: true
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            that.can_scroll = false;
            var options = {};
            options.action = 'getmallsurveylist';
            options.pageindex = that.form.pageindex;
            options.pagesize = that.form.pagesize;
            options.type = 1;
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    if (data.list.length == that.form.pagesize) {
                        that.can_scroll = true;
                    }
                    if (that.form.pageindex == 0) {
                        that.list = data.list;
                    } else {
                        that.list = that.list.concat(data.list);
                    }
                    app.current_item_length = that.list.length;
                    that.haslist = (that.list.length > 0);
                } else if (err) {
                    that.list = [];
                    that.current_item_length = 0;
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, { toast: true });
        },
        open_win: function(item) {
            var that = this;
            ns.openWin('dl_wenjuandcdetail_frm', item.title, {
                title: item.title, //item.title
                url: 'dl_wenjuandcdetail_frm.html',
                id:item.id  // item.id
            }, { needlogin: true });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.get_data();
};
//     var pullRefresh = new auiPullToRefresh({
//     container: document.querySelector('.aui-refresh-content'),
//     triggerDistance: 100
// }, function(ret) {
//     if (ret.status == "success") {
//         setTimeout(function() {
//             app.form.pageindex = 0;
//             app.get_data();
//             pullRefresh.cancelLoading(); //刷新成功后调用此方法隐藏
//         }, 1500)
//     }
// })
// var scroll = new auiScroll({
//     listen: true,
//     distance: 0 //判断到达底部的距离，isToBottom为true
// }, function(ret) {
//     if (ret.isToBottom && app.can_scroll) {
//         if (app.scroll_top > ret.scrollTop) {
//             app.scroll_top = ret.scrollTop;
//             return;
//         }
//         app.scroll_top = ret.scrollTop + 1;
//         app.form.pageindex = app.current_item_length;
//         app.get_data();
//     }
// });
