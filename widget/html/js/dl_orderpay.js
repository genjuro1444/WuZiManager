var ns, wxPay, aliPayPlus, toast;
var app = new Vue({
    el: '#app',
    data: {
        paymentlist: [{
            title: '微信支付',
            key: 'wxpay',
            css: 'icon-weixin',
            checked: false
        }, {
            title: '支付宝支付',
            key: 'alipay',
            css: 'icon-alipay',
            checked: false
        }],
        orderlist: [],
        ordersummary: {
            totalprice: 0,
            totalpricedesc: ''
        },
        paymentid: 0,
        orderid: 0,
        orderidlist: [],
        selected_payment: '',
        show_shiprate: false,
        pwdvalid: false,
        show_shadow: false
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getorderlistinfo',
                orderid: that.orderid,
                orderidlist: JSON.stringify(that.orderidlist)
            }, function(succeed, data, err) {
                if (succeed) {
                    that.orderlist = data.list;
                    that.ordersummary = data.ordersummary;
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        select_paymentmethod: function(item) {
            var that = this;
            for (var i = 0; i < that.paymentlist.length; i++) {
                that.paymentlist[i].checked = false;
            }
            item.checked = true;
            that.selected_payment = item.key;
        },
        do_pay: function() {
            var that = this;
            if (that.selected_payment == '' && that.ordersummary.totalprice > 0) {
                api.toast({
                    msg: '请选择付款方式',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.ordersummary.totalsalepoint > 0 || that.selected_payment == 'balance') {
                if (!that.pwdvalid) {
                    that.open_pay_pwd();
                    return;
                }
            }
            if (that.ordersummary.totalsalepoint > 0 && that.ordersummary.totalprice <= 0) {
                that.do_pay_point();
                return;
            }
            if (that.ordersummary.totalprice <= 0) {
                if (!that.pwdvalid) {
                    that.do_conpon_pay();
                    return;
                }
                that.do_free_pay();
                return;
            }
            if (that.selected_payment == 'wxpay') {
                that.do_weixin_pay();
                return;
            }
            if (that.selected_payment == 'alipay') {
                that.do_alipay();
                return;
            }
            if (that.selected_payment == 'balance') {
                that.do_balance_pay();
                return;
            }
            api.toast({
                msg: '请选择付款方式',
                duration: 2000,
                location: 'bottom'
            });
        },
        do_conpon_pay: function() {
            var that = this;
            var frameH = api.winHeight;
            var frameW = api.winWidth;
            var rect_x = 10;
            var rect_y = (frameH * 0.5) - 150;
            var rect_w = frameW - 20;
            var rect_h = 200;
            var delay = 0;
            if (api.systemType != 'ios') {
                delay = 100;
            }
            that.show_shadow = true;
            api.openFrame({
                name: 'orderbalancepay_frm',
                url: '../html/orderbalancepay_frm.html',
                delay: delay,
                slidBackEnabled: false,
                vScrollBarEnabled: false,
                pageParam: {
                    id: that.orderid,
                    ids: JSON.stringify(that.orderidlist)
                },
                rect: {
                    x: rect_x,
                    y: rect_y,
                    w: rect_w,
                    h: rect_h,
                },
                animation: {
                    type: 'movein',
                    subType: 'from_bottom'
                }
            });
        },
        do_free_pay: function() {
            var that = this;
            ns.post({
                action: 'dopayfreeorder',
                orderid: that.orderid,
                orderidlist: JSON.stringify(that.orderidlist),
                paymentid: that.paymentid
            }, function(succeed, data, err) {
                if (succeed) {
                    that.open_order_complete();
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: true,
                toastmsg: '支付中'
            });
        },
        do_pay_point: function() {
            var that = this;
            ns.post({
                action: 'dopaypointorder',
                orderid: that.orderid,
                orderidlist: JSON.stringify(that.orderidlist),
                paymentid: that.paymentid
            }, function(succeed, data, err) {
                if (succeed) {
                    that.open_order_complete();
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: true,
                toastmsg: '支付中'
            });
        },
        do_weixin_pay: function() {
            var that = this;
            ns.post({
                action: 'wxpayorderready',
                orderid: that.orderid,
                orderidlist: JSON.stringify(that.orderidlist),
                paymentid: that.paymentid
            }, function(succeed, data, err) {
                if (succeed) {
                    var options = {
                        apiKey: data.apiKey,
                        orderId: data.orderId,
                        mchId: data.mchId,
                        nonceStr: data.noncestr,
                        timeStamp: data.timestamp,
                        package: data.package,
                        sign: data.sign
                    };
                    wxPay.payOrder(options, function(ret, err) {
                        if (ret.status) {
                            api.toast({
                                msg: '支付成功',
                                duration: 2000,
                                location: 'bottom'
                            });
                            that.open_order_complete();
                        } else {
                            if (err.code == "-1") {
                                api.toast({
                                    msg: "系统繁忙，请稍后再试",
                                    duration: 2000,
                                    location: 'bottom'
                                });
                            } else if (err.code == "-2") {
                                api.toast({
                                    msg: "用户取消支付",
                                    duration: 2000,
                                    location: 'bottom'
                                });
                            } else {
                                api.toast({
                                    msg: err.msg,
                                    duration: 2000,
                                    location: 'bottom'
                                });
                            }
                        }
                    });
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: true,
                toastmsg: '支付中'
            });
        },
        do_alipay: function() {
            var that = this;
            ns.post({
                action: 'alipayorderready',
                orderid: that.orderid,
                orderidlist: JSON.stringify(that.orderidlist),
                paymentid: that.paymentid
            }, function(succeed, data, err) {
                if (succeed) {
                    aliPayPlus.payOrder({
                        orderInfo: data
                    }, function(ret, err) {
                        if (err) {
                            api.toast({
                                msg: err,
                                duration: 2000,
                                location: 'bottom'
                            });
                            return;
                        } else {
                            if (ret.code == "9000") {
                                api.toast({
                                    msg: "支付成功",
                                    duration: 1000,
                                    location: 'bottom'
                                });
                                that.open_order_complete();
                            } else {
                                api.toast({
                                    msg: '系统异常',
                                    duration: 2000,
                                    location: 'bottom'
                                });
                            }
                            return;
                        }
                    });
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: true,
                toastmsg: '支付中'
            });
        },
        open_pay_pwd: function() {
            var that = this;
            ns.post({
                action: 'balanceorderready',
                orderid: that.orderid,
                orderidlist: JSON.stringify(that.orderidlist),
                payment: that.selected_payment,
                paymentid: that.paymentid
            }, function(succeed, data, err) {
                if (succeed) {
                    var frameH = api.winHeight;
                    var frameW = api.winWidth;
                    var rect_x = 10;
                    var rect_y = (frameH * 0.5) - 150;
                    var rect_w = frameW - 20;
                    var rect_h = 200;
                    var delay = 0;
                    if (api.systemType != 'ios') {
                        delay = 100;
                    }
                    that.show_shadow = true;
                    api.openFrame({
                        name: 'orderbalancepay_frm',
                        url: '../html/orderbalancepay_frm.html',
                        delay: delay,
                        slidBackEnabled: false,
                        vScrollBarEnabled: false,
                        pageParam: {
                            id: that.orderid,
                            ids: JSON.stringify(that.orderidlist)
                        },
                        rect: {
                            x: rect_x,
                            y: rect_y,
                            w: rect_w,
                            h: rect_h,
                        },
                        animation: {
                            type: 'movein',
                            subType: 'from_bottom'
                        }
                    });
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_balance_pay: function() {
            var that = this;
            ns.post({
                action: 'payorderbybalance',
                orderid: that.orderid,
                orderidlist: JSON.stringify(that.orderidlist),
                password: that.password
            }, function(succeed, data, err) {
                if (succeed) {
                    that.open_order_complete();
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: true,
                toastmsg: '支付中'
            });
        },
        open_order_complete: function() {
            var that = this;
            ns.openWin('ordercomplete_frm', '订单完成', {
                title: '订单完成',
                url: 'ordercomplete_frm.html',
                id: that.orderid,
                orderidlist: JSON.stringify(that.orderidlist),
                type: 7
            }, {
                needlogin: true
            });
        },
        doClose: function() {
            api.closeFrame();
            api.sendEvent({
                name: 'do_close_orderconfirm'
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    wxPay = api.require('wxPay');
    aliPayPlus = api.require('aliPayPlus');
    app.orderid = api.pageParam.id || 0;
    app.paymentid = api.pageParam.paymentid || 0;
    var orderids = api.pageParam.ids || '[]';
    app.orderidlist = eval('(' + orderids + ')');
    app.get_data();
    setTimeout(function() {
        api.sendEvent({
            name: 'on_open_orderpay'
        });
    }, 100);
    api.addEventListener({
        name: 'on_open_ordercomplete'
    }, function() {
        setTimeout(function() {
            api.closeWin();
        }, 500);
    });
    api.addEventListener({
        name: 'close_pwd_pay'
    }, function() {
        app.show_shadow = false;
    });
    api.addEventListener({
        name: 'orderpay_pwdvalid'
    }, function() {
        app.show_shadow = false;
        app.pwdvalid = true;
        app.do_pay();
    });
};
