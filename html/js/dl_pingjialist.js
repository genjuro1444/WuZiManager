var ns, toast, map;
var app = new Vue({
    el: '#app',
    data: {
        ProductId: 0,
        list: {},
        form: {
            pageindex: 0,
            pagesize: 10,
        },
        currentCount: 0
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.id = that.ProductId;
            options.action = 'getmallproductratelist';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    if (that.form.pageindex == 0) {
                        that.list = data.list;
                    } else {
                        that.list = that.list.concat(data.list);
                    }
                    that.currentCount = that.list.length;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        }

    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.ProductId = api.pageParam.id;
    toast = new auiToast();
    app.get_data();
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
            app.form.pageindex = app.currentCount;
            app.get_data();
        }
    });
};
