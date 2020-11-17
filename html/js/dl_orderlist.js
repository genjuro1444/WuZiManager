var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        status: 0,
        list: [],
        form: {
            pageindex: 0,
            pagesize: 10,
        },
        current_item_length: 0,
        is_searching: false,
        scroll_top: 0,
        can_scroll: true,
        totalsummary: {
            allchecked: false,
            totaldesc: ''
        },
        isshareorder: false,
        iscancell: false,
        itisrefund: false,
        is_refundList: [],
    },
    methods: {
        isrefunding: function(item) {
            var that = this;
            if (that.status == 6 || that.status == 10) {
                return true;
            }
            if (that.status == 4 && item.ordersummary.status == 7) {
                return true;
            }
            return false;
        },
        get_data: function() {
            var that = this;
            that.is_searching = true;
            that.can_scroll = false;
            var options = {};
            options.pageindex = that.form.pageindex;
            options.pagesize = that.form.pagesize;
            options.action = 'getmyorderlist';
            options.status = that.status;
            options.isshareorder = that.isshareorder;
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
                    for (var i = 0; i < data.list.length; i++) {
                        that.leftTimer(data.list[i]);
                    }
                } else if (err) {
                    that.list = [];
                    that.current_item_length = 0;
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: true
            });
        },
        do_pay: function(item) {
            var that = this;
            var title = '订单支付';
            var name = 'dl_orderpay_frm';
            var that = this;
            var name = 'dl_orderpay_frm';
            api.openFrame({
                name: name,
                url: name + '.html',
                bounces: false,
                pageParam: {
                    id: item.ordersummary.id
                },
                rect: {
                    x: 0,
                    y: 0,
                    w: 'auto',
                    h: 'auto',
                    marginBottom: 0
                }
            });
        },
        do_close: function(item) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确认关闭?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    ns.post({
                        action: 'closemyorder',
                        id: item.ordersummary.id
                    }, function(succeed, data, err) {
                        if (succeed) {
                            api.toast({
                                msg: '操作成功',
                                duration: 2000,
                                location: 'bottom'
                            });
                            api.sendEvent({
                                name: 'close_order_success'
                            });
                        } else {
                            api.toast({
                                msg: err,
                                duration: 2000,
                                location: 'bottom'
                            });
                        }
                    });
                }
            });
        },
        do_rate: function(item) {
            var that = this;
            ns.openWin('dl_orderrate_frm', '订单评价', {
                id: item.ordersummary.id
            }, {
                needlogin: true
            });
        },
        do_view: function(item) {
            var that = this;
            ns.openWin('dl_order_detail', '订单详情', {
                id: item.ordersummary.id
            }, {
                needlogin: true
            });
        },
        do_refundview: function(item) {
            var that = this;
            ns.openWin('dl_orderrefund_frm', '退款详情', {
                id: item.ordersummary.id,
                type: 101
            }, {
                needlogin: true
            });
        },
        do_remove: function(item) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确认删除?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    ns.post({
                        action: 'removemyorder',
                        id: item.ordersummary.id
                    }, function(succeed, data, err) {
                        if (succeed) {
                            api.toast({
                                msg: '操作成功',
                                duration: 2000,
                                location: 'bottom'
                            });
                            api.sendEvent({
                                name: 'close_order_success'
                            });
                        } else {
                            api.toast({
                                msg: err,
                                duration: 2000,
                                location: 'bottom'
                            });
                        }
                    });
                }
            });
        },
        do_refund: function(item) {
            var that = this;
            ns.openWin('dl_orderrefund_frm', '订单退款', {
                id: item.ordersummary.id
            }, {
                needlogin: true
            });
        },
        do_unrefund: function(item) {
            var that = this;
            api.confirm({
                title: '是否取消退款',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                var index = ret.buttonIndex;
                if (index == 1) {
                    ns.post({
                        action: 'cancelmallorderrefund',
                        id: item.ordersummary.id
                    }, function(succeed, data, err) {
                        if (succeed) {
                            api.toast({
                                msg: '操作成功',
                                duration: 2000,
                                location: 'bottom'
                            });
                            api.sendEvent({
                                name: 'onorderrefund',
                            });
                        } else {
                            api.toast({
                                msg: err,
                                duration: 2000,
                                location: 'bottom'
                            });
                        }
                    });
                }
            });
        },
        open_business: function(id) {
            var that = this;
            ns.openWin('dl_business_frm', '商家详情', {
                id: id,
                searchtype: 2
            });
        },
        do_confirmship: function(item) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确认收货?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    ns.post({
                        action: 'confirmreceivemyorder',
                        id: item.ordersummary.id
                    }, function(succeed, data, err) {
                        if (succeed) {
                            api.toast({
                                msg: '操作成功',
                                duration: 2000,
                                location: 'bottom'
                            });
                            api.sendEvent({
                                name: 'close_order_success'
                            });
                        } else {
                            api.toast({
                                msg: err,
                                duration: 2000,
                                location: 'bottom'
                            });
                        }
                    });
                }
            });
        },
        do_select: function(item) {
            var that = this;
            item.ordersummary.ischecked = !item.ordersummary.ischecked;
            that.calculate_total();
        },
        calculate_total: function() {
            var that = this;
            that.totalsummary.allchecked = false;
            that.totalsummary.totaldesc = '';
            var totalprice = 0;
            var totalpoint = 0;
            var all_checked = true;
            for (var i = 0; i < that.list.length; i++) {
                var item = that.list[i];
                if (!item.ordersummary.ischecked) {
                    all_checked = false;
                }
                if (item.ordersummary.ischecked) {
                    totalprice += item.productsummary.totalprice;
                    totalpoint += item.productsummary.totalpoint;
                }
            }
            that.totalsummary.allchecked = all_checked;
            if (totalprice > 0) {
                that.totalsummary.totaldesc += '￥' + totalprice.toFixed(2);
            }
            if (that.totalsummary.totaldesc != '') {
                that.totalsummary.totaldesc += ' + ';
            }
            if (totalpoint > 0) {
                that.totalsummary.totaldesc += totalpoint + '积分';
            }
        },
        select_all: function() {
            var that = this;
            that.totalsummary.allchecked = !that.totalsummary.allchecked;
            for (var i = 0; i < that.list.length; i++) {
                var item = that.list[i];
                item.ordersummary.ischecked = that.totalsummary.allchecked;
            }
            that.calculate_total();
        },
        do_pay_all: function(item) {
            var that = this;
            var IDList = [];
            for (var i = 0; i < that.list.length; i++) {
                var item = that.list[i];
                if (item.ordersummary.ischecked) {
                    IDList.push(item.ordersummary.id);
                }
            }
            if (IDList.length == 0) {
                api.toast({
                    msg: '请选择待支付订单',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            var title = '订单支付';
            var name = 'orderpay_frm';
            ns.openWin(name, title, {
                title: title,
                url: name + '.html',
                ids: JSON.stringify(IDList),
            }, {
                needlogin: true
            });
        },
        leftTimer: function(item) {
            var that = this;
            if (item.ordersummary.countdown_timmer) {
                clearInterval(item.ordersummary.countdown_timmer);
                return;
            }
            if (!item.ordersummary.canconfirmship) {
                return;
            }
            var s1 = new Date(item.ordersummary.countdowndate.replace(/-/g, "/"));
            item.ordersummary.leftTime = s1 - new Date(); //计算剩余的毫秒数
            item.ordersummary.countdown_timmer = setInterval(function() {
                that.do_leftTimer(item);
            }, 1000);
        },
        do_leftTimer: function(item) {
            var that = this;
            if (!item.ordersummary.canconfirmship) {
                clearInterval(item.ordersummary.countdown_timmer);
                return;
            }
            item.ordersummary.leftTime = item.ordersummary.leftTime - 1000;
            if (item.ordersummary.leftTime <= 0) {
                if (item.ordersummary.countdown_timmer != null) {
                    clearInterval(item.ordersummary.countdown_timmer);
                }
                return;
            }
            var days = parseInt(item.ordersummary.leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数
            var hours = days * 24 + parseInt(item.ordersummary.leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时
            var minutes = parseInt(item.ordersummary.leftTime / 1000 / 60 % 60, 10); //计算剩余的分钟
            var seconds = parseInt(item.ordersummary.leftTime / 1000 % 60, 10); //计算剩余的秒数
            var min_seconds = parseInt((item.ordersummary.leftTime % 1000) / 100, 10);
            days = that.checkTime(days);
            hours = that.checkTime(hours);
            minutes = that.checkTime(minutes);
            seconds = that.checkTime(seconds);
            var result = hours + '小时' + minutes + '分' + seconds + '秒';
            item.ordersummary.countdownday = result;
        },
        checkTime: function(i) { //将0-9的数字前面加上0，例1变为01
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.status = api.pageParam.status || 0;
    app.isshareorder = api.pageParam.isshareorder || false;
    toast = new auiToast();
    app.get_data();
    api.addEventListener({
        name: 'close_order_success'
    }, function() {
        app.get_data();
    });
    setTimeout(function() {
        api.sendEvent({
            name: 'on_open_orderpay'
        });
    }, 100);
    api.addEventListener({
        name: 'on_open_ordercomplete'
    }, function() {
        setTimeout(function() {
            app.get_data();
        }, 500);
    });
    api.addEventListener({
        name: 'onorderrefund'
    }, function() {
        setTimeout(function() {
            app.get_data();
        }, 500);
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
