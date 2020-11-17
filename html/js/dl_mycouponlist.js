var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        status: 0,
        css: '',
        list: [],
        form: {
            pageindex: 0,
            pagesize: 10,
        },
        current_item_length: 0,
        is_searching: false,
        scroll_top: 0,
        can_scroll: true,
    },
    methods: {
        get_data: function() {
            var that = this;
            if (that.status == 0) {
                that.css = 'notake';
            } else if (that.status == 1) {
                that.css = 'notuse';
            } else if (that.status == 2) {
                that.css = 'used';
            } else if (that.status == 3) {
                that.css = 'expired';
            }
            that.is_searching = true;
            that.can_scroll = false;
            var options = {};
            options.pageindex = that.form.pageindex;
            options.pagesize = that.form.pagesize;
            options.action = 'getmycouponlist';
            options.status = that.status;
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
                    that.current_item_length = that.list.length;
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
        do_open: function(item) {
            var that = this;
            if (that.status == 0) {
                that.do_take(item);
                return;
            }
            if (that.status == 1) {
                that.do_view(item);
                return;
            }
        },
        do_view: function(item) {
            var that = this;
            var name = '';
            var title = '';
            if (item.coupontypeid == 1 && item.relatedid > 0) {
                name = 'dl_product_frm';
                title = '商品详情';
            } else if (item.coupontypeid == 2 && item.relatedid > 0) {
                name = 'business_frm';
                title = '商家详情';
            } else if (item.coupontypeid == 3) {
                name = 'category_frm';
                title = '商品列表';
            } else if (item.coupontypeid == 4 && item.relatedid > 0) {
                name = 'category_frm';
                title = '商品列表';
            } else if (item.coupontypeid == 5) {
                name = 'wuyejf_frm';
                title = '物业缴费';
            } else {
                return;
            }
            ns.openWin(name, title, {
                title: title,
                url: name + '.html',
                id: item.relatedid
            })
        },
        do_take: function(item) {
            var that = this;
            if (that.status != 0) {
                return;
            }
            var options = {};
            options.action = 'takemycoupon';
            options.id = item.id;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '领取成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    api.sendEvent({
                        name: 're_get_coupon_list'
                    });
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, { toast: true, toastmsg: '领取中' });
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.status = api.pageParam.status || 0;
    toast = new auiToast();
    app.get_data();
    api.addEventListener({
        name: 're_get_coupon_list'
    }, function() {
        app.get_data();
    });
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
            app.form.pageindex = app.current_item_length;
            app.get_data();
        }
    });
}
