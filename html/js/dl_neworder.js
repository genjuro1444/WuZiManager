var ns, UIMultiSelector;
var app = new Vue({
    el: '#app',
    data: {
        show_address: true,
        order_type: 0, //1-物业收费 2-购买商品 4-购物车商品 6-拼团成功，准备购买 14-购买服务
        buytype: 0, //16-普通商品详情 17-积分商品详情 18-合伙人商品详情
        orderid: 0,
        paymentid: 0,
        productid: 0,
        houseserviceid: 0,
        quantity: 0,
        variantid: 0,
        cartidlist: '',
        productlist: [],
        business: {},
        cartlist: [],
        productsummary: {
            totaldesc: '',
            totalprice: 0,
        },
        ordersummary: {
            totaldesc: '',
            totalprice: 0,
        },
        user_note: '',
        myaddress: {
            id: 0,
            username: '',
            phonenumber: '',
            addressdetail: '',
        },
        noaddress: true,
        shiprate: {
            name: '',
            amount: 0
        },
        shipratelist: [],
        couponform: {
            id: 0,
            couponid: 0,
            text: '无',
            price: '',
            pricedesc: '',
        },
        couponlist: [],
        allcouponlist: [],
        pay: {
            totalprice: 0,
            totalsalepoint: 0,
            totaldesc: ''
        },
        AmountRuleID: 0,
        AdditionalPoint: 0
    },
    methods: {
        get_data: function() {
            var that = this;
            if (that.order_type == 1 && that.paymentid > 0) { //物业缴费
                that.show_address = false;
                that.get_payment_info();
            } else if (that.order_type == 2) { //直接购买商品
                that.show_address = true;
                that.get_product_info();
            } else if (that.order_type == 4) { //购买购物车多个商品
                that.show_address = true;
                that.get_cart_info();
            } else if (that.order_type == 6) { //支付订单预览
                that.show_address = true;
                that.get_order_info();
            } else if (that.order_type == 14) { //生活服务购买
                that.show_address = false;
                that.get_houseservice_info();
            }
        },
        get_address_info: function(id) {
            var that = this;
            if (!that.show_address) {
                that.calculate_totalcost();
                return;
            }
            ns.post({
                action: 'getmyshipaddressinfo',
                id: id,
                quantity: that.quantity,
                productid: that.productid,
                orderid: that.orderid,
                cartidlist: that.cartidlist,
            }, function(succeed, data, err) {
                if (succeed) {
                    if (data.myaddress) {
                        that.myaddress = data.myaddress;
                    }
                    that.noaddress = data.noaddress;
                    that.shipratelist = data.shipratelist;
                    if (that.cartlist.length > 0) {
                        for (var i = 0; i < that.cartlist.length; i++) {
                            var item = that.cartlist[i];
                            item.shipratelist = [];
                            for (var j = 0; j < that.shipratelist.length; j++) {
                                var item2 = that.shipratelist[j];
                                if (item2.BusinessID == item.business.id) {
                                    item.shipratelist.push(item2);
                                }
                            }
                            if (item.shipratelist.length > 0) {
                                for (var j = 0; j < item.shipratelist.length; j++) {
                                    if (item.shipratelist[j].isdefault) {
                                        item.shiprate = item.shipratelist[j];
                                        break;
                                    }
                                    if (j == item.shipratelist.length - 1) {
                                        item.shiprate = item.shipratelist[0];
                                    }
                                }
                            }
                        }
                    }
                    if (that.shipratelist.length > 0) {
                        for (var j = 0; j < that.shipratelist.length; j++) {
                            if (that.shipratelist[j].isdefault) {
                                that.shiprate = that.shipratelist[j];
                                break;
                            }
                            if (j == that.shipratelist.length - 1) {
                                that.shiprate = that.shipratelist[0];
                            }
                        }
                    }
                    that.calculate_totalcost();
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_select_coupon: function(item) {
            var that = this;
            var list = that.couponlist;
            if (item) {
                list = item.couponlist;
            }
            if (list.length == 0) {
                return;
            }
            UIMultiSelector.open({
                rect: {
                    h: 244
                },
                text: {
                    title: '选择福顺券',
                    leftBtn: '取消',
                    rightBtn: '完成',
                    selectAll: ''
                },
                max: 0,
                singleSelection: true,
                styles: {
                    bg: '#fff',
                    mask: 'transparent',
                    title: {
                        bg: '#ddd',
                        color: '#808080',
                        size: 16,
                        h: 44
                    },
                    leftButton: {
                        bg: '#ffc107',
                        w: 80,
                        h: 35,
                        marginT: 5,
                        marginL: 8,
                        color: '#fff',
                        size: 14
                    },
                    rightButton: {
                        bg: '#ffc107',
                        w: 80,
                        h: 35,
                        marginT: 5,
                        marginR: 8,
                        color: '#fff',
                        size: 14
                    },
                    item: {
                        h: 35,
                        bg: '#fff',
                        bgActive: '#ffc107',
                        bgHighlight: '#ffc107',
                        color: '#808080',
                        active: '#fff',
                        highlight: '#fff',
                        size: 14,
                        lineColor: '#ddd',
                        textAlign: 'center'
                    },
                    icon: {
                        w: 0,
                        marginH: 0
                    }
                },
                animation: true,
                items: list
            }, function(ret, err) {
                if (ret) {
                    if (ret.eventType == 'clickRight') {
                        if (ret.items.length > 0) {
                            if (item) {
                                item.couponform = ret.items[0];
                            } else {
                                that.couponform = ret.items[0];
                            }
                            that.calculate_counpon_count();
                            that.calculate_totalcost();
                        }
                        UIMultiSelector.close();
                    }
                    if (ret.eventType == 'clickLeft' || ret.eventType == 'clickMask') {
                        UIMultiSelector.close();
                    }
                }
            });
        },
        calculate_counpon_count: function() {
            var that = this;
            if (that.cartlist.length > 0) {
                for (var i = 0; i < that.cartlist.length; i++) {
                    var item = that.cartlist[i];
                    item.couponform.id = 0;
                    for (var j = 0; j < item.allcouponlist.length; j++) {
                        var item2 = item.allcouponlist[j];
                        item2.isused = false;
                    }
                }
                for (var i = 0; i < that.cartlist.length; i++) {
                    var item = that.cartlist[i];
                    if (item.couponform.couponid <= 0) {
                        continue;
                    }
                    for (var j = 0; j < that.cartlist.length; j++) {
                        var item2 = that.cartlist[j];
                        for (var k = 0; k < item2.allcouponlist.length; k++) {
                            var item3 = item2.allcouponlist[k];
                            if (item3.isused) {
                                continue;
                            }
                            if (item.couponform.id == item3.id) {
                                item3.isused = true;
                                break;
                            }
                            if (item.couponform.couponid == item3.couponid) {
                                item.couponform.id = item3.id;
                                item3.isused = true;
                                break;
                            }
                        }
                    }
                }
                for (var i = 0; i < that.cartlist.length; i++) {
                    var item = that.cartlist[i];
                    var list = [];
                    var couponidlist = [];
                    for (var j = 0; j < item.allcouponlist.length; j++) {
                        var item2 = item.allcouponlist[j];
                        if (item2.isused) {
                            continue;
                        }
                        if (that.in_array(couponidlist, item2.couponid)) {
                            continue;
                        }
                        couponidlist.push(item2.couponid);
                        list.push(item2);
                    }
                    item.couponlist = list;
                }
            } else {
                that.couponform.id = 0;
                for (var i = 0; i < that.allcouponlist.length; i++) {
                    var item = that.allcouponlist[i];
                    item.isused = false;
                }
                if (that.couponform.couponid <= 0) {
                    return;
                }
                for (var i = 0; i < that.allcouponlist.length; i++) {
                    var item = that.allcouponlist[i];
                    if (item.isused) {
                        continue;
                    }
                    if (that.couponform.id == item.id) {
                        item.isused = true;
                        break;
                    }
                    if (that.couponform.couponid == item.couponid) {
                        that.couponform.id = item.id;
                        item.isused = true;
                        break;
                    }
                }
                var list = [];
                var couponidlist = [];
                for (var i = 0; i < that.allcouponlist.length; i++) {
                    var item = that.allcouponlist[i];
                    if (item.isused) {
                        continue;
                    }
                    if (that.in_array(couponidlist, item.couponid)) {
                        continue;
                    }
                    couponidlist.push(item.couponid);
                    list.push(item);
                }
                that.couponlist = list;
            }
        },
        in_array: function(list, id) {
            var that = this;
            for (var i = 0; i < list.length; i++) {
                if (list[i] == id) {
                    return true;
                }
            }
            return false;
        },
        do_select_ship: function(item) {
            var that = this;
            var list = that.shipratelist;
            if (item) {
                list = item.shipratelist;
            }
            if (list.length == 0) {
                return;
            }
            UIMultiSelector.open({
                rect: {
                    h: 244
                },
                text: {
                    title: '',
                    leftBtn: '取消',
                    rightBtn: '完成',
                    selectAll: ''
                },
                max: 0,
                singleSelection: true,
                styles: {
                    bg: '#fff',
                    mask: 'transparent',
                    title: {
                        bg: '#ddd',
                        color: '#808080',
                        size: 16,
                        h: 44
                    },
                    leftButton: {
                        bg: '#ffc107',
                        w: 80,
                        h: 35,
                        marginT: 5,
                        marginL: 8,
                        color: '#fff',
                        size: 14
                    },
                    rightButton: {
                        bg: '#ffc107',
                        w: 80,
                        h: 35,
                        marginT: 5,
                        marginR: 8,
                        color: '#fff',
                        size: 14
                    },
                    item: {
                        h: 35,
                        bg: '#fff',
                        bgActive: '#ffc107',
                        bgHighlight: '#ffc107',
                        color: '#808080',
                        active: '#fff',
                        highlight: '#fff',
                        size: 14,
                        lineColor: '#ddd',
                        textAlign: 'center'
                    },
                    icon: {
                        w: 0,
                        marginH: 0
                    }
                },
                animation: true,
                items: list
            }, function(ret, err) {
                if (ret) {
                    if (ret.eventType == 'clickRight') {
                        if (ret.items.length > 0) {
                            if (item) {
                                item.shiprate = ret.items[0];
                            } else {
                                that.shiprate = ret.items[0];
                            }
                        }
                        UIMultiSelector.close();
                        that.calculate_totalcost();
                    }
                    if (ret.eventType == 'clickLeft' || ret.eventType == 'clickMask') {
                        UIMultiSelector.close();
                    }
                }
            });
        },
        calculate_totalcost: function() {
            var that = this;
            var shiprateamount = 0;
            var couponamount = 0;
            if (that.cartlist.length > 0) {
                for (var i = 0; i < that.cartlist.length; i++) {
                    var item = that.cartlist[i];
                    shiprateamount += (item.shiprate.amount > 0 ? item.shiprate.amount : 0);
                    couponamount += (item.couponform.price > 0 ? item.couponform.price : 0);
                }
            } else {
                shiprateamount = (that.shiprate.amount > 0 ? that.shiprate.amount : 0);
                couponamount = (that.couponform.price > 0 ? that.couponform.price : 0);
            }
            that.pay.totalprice = that.ordersummary.totalprice + shiprateamount - couponamount;
            that.pay.totalprice = (that.pay.totalprice > 0 ? that.pay.totalprice : 0);
            that.pay.totalsalepoint = that.ordersummary.totalsalepoint;
            if (that.pay.totalprice > 0 && that.pay.totalsalepoint > 0) {
                that.pay.totaldesc = "￥" + that.pay.totalprice.toFixed(2) + " + " + that.pay.totalsalepoint + "积分";
            } else if (that.pay.totalsalepoint > 0) {
                that.pay.totaldesc = that.pay.totalsalepoint + "积分";
            } else {
                that.pay.totaldesc = "￥" + that.pay.totalprice.toFixed(2);
            }
        },
        do_choose_address: function() {
            var that = this;
            ns.openWin('dl_shouhuodizhi_frm', '选择收货地址', {
                title: '选择收货地址',
                url: 'dl_shouhuodizhi_frm.html',
                type: 5
            }, {
                needlogin: true
            });
        },
        get_payment_info: function() {
            var that = this;
            ns.post({
                action: 'getroomfeeorderlist',
                paymentid: that.paymentid
            }, function(succeed, data, err) {
                if (succeed) {
                    that.productlist = data.productlist;
                    that.productsummary = data.productsummary;
                    that.ordersummary = data.ordersummary;
                    that.show_address = false;
                    that.allcouponlist = data.allcouponlist;
                    that.couponlist = data.couponlist;
                    if (that.couponlist.length > 0) {
                        that.couponform.text = '请选择';
                    }
                    that.get_address_info(0);
                    that.AmountRuleID = data.AmountRuleID;
                    that.AdditionalPoint = data.AdditionalPoint;
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        get_product_info: function() {
            var that = this;
            ns.post({
                action: 'getproductorderlist',
                productid: that.productid,
                quantity: that.quantity,
                variantid: that.variantid,
                type: that.buytype
            }, function(succeed, data, err) {
                if (succeed) {
                    that.productlist = data.productlist;
                    that.productsummary = data.productsummary;
                    that.ordersummary = data.ordersummary;
                    that.business = data.business;
                    that.show_address = true;
                    that.get_address_info(0);
                    that.allcouponlist = data.allcouponlist;
                    that.couponlist = data.couponlist;
                    if (that.couponlist.length > 0) {
                        that.couponform.text = '请选择';
                    }
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        get_cart_info: function() {
            var that = this;
            ns.post({
                action: 'getshoppingcartorderlist',
                cartidlist: that.cartidlist,
            }, function(succeed, data, err) {
                if (succeed) {
                    that.cartlist = data.cartlist;
                    that.ordersummary = data.ordersummary;
                    that.show_address = true;
                    that.get_address_info(0);
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        get_order_info: function() {
            var that = this;
            ns.post({
                action: 'getorderinfo',
                orderid: that.orderid
            }, function(succeed, data, err) {
                if (succeed) {
                    that.productlist = data.productlist;
                    that.productsummary = data.productsummary;
                    if (data.myaddress) {
                        that.myaddress = data.myaddress;
                    }
                    that.business = data.businessinfo;
                    that.show_address = true;
                    that.get_address_info(0);
                    that.ordersummary = data.ordersummary;
                    that.allcouponlist = data.allcouponlist;
                    that.couponlist = data.couponlist;
                    if (that.couponlist.length > 0) {
                        that.couponform.text = '请选择';
                    }
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        get_houseservice_info: function() {
            var that = this;
            ns.post({
                action: 'gethouseserviceorderlist',
                id: that.houseserviceid,
                variantid: that.variantid,
                quantity: that.quantity
            }, function(succeed, data, err) {
                if (succeed) {
                    that.productlist = data.productlist;
                    that.productsummary = data.productsummary;
                    that.ordersummary = data.ordersummary;
                    that.business = data.business;
                    that.show_address = true;
                    that.get_address_info(0);
                    that.allcouponlist = data.allcouponlist;
                    that.couponlist = data.couponlist;
                    if (that.couponlist.length > 0) {
                        that.couponform.text = '请选择';
                    }
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_pay: function() {
            var that = this;
            if (that.myaddress.id == 0 && that.show_address) {
                api.toast({
                    msg: '请选择收获地址',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.order_type == 1) {
                ns.post({
                    action: 'createfeeorder',
                    paymentid: that.paymentid,
                    user_note: that.user_note,
                    couponid: that.couponform.couponid,
                    couponuserid: that.couponform.id,
                    couponprice: that.couponform.price,
                    AmountRuleID: that.AmountRuleID,
                    AdditionalPoint: that.AdditionalPoint
                }, function(succeed, data, err) {
                    if (succeed) {
                        that.open_orderpay(data.id);
                    } else {
                        api.toast({
                            msg: err,
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                });
                return;
            }
            if (that.order_type == 2) {
                ns.post({
                    action: 'createproductorder',
                    productid: that.productid,
                    quantity: that.quantity,
                    variantid: that.variantid,
                    user_note: that.user_note,
                    addressid: that.myaddress.id,
                    couponid: that.couponform.couponid,
                    couponuserid: that.couponform.id,
                    couponprice: that.couponform.price,
                    shiprateid: that.shiprate.id,
                    shipratename: that.shiprate.name,
                    shiprateamount: that.shiprate.amount,
                    shipratetype: that.shiprate.RateType,
                    type: that.buytype
                }, function(succeed, data, err) {
                    if (succeed) {
                        that.open_orderpay(data.id);
                    } else {
                        api.toast({
                            msg: err,
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                });
                return;
            }
            if (that.order_type == 4) {
                var list = [];
                for (var i = 0; i < that.cartlist.length; i++) {
                    var item = that.cartlist[i];
                    list.push({
                        businessid: item.business.id,
                        couponform: item.couponform,
                        user_note: item.user_note,
                        shiprateform: item.shiprate
                    });
                }
                ns.post({
                    action: 'createcartorder',
                    cartidlist: that.cartidlist,
                    addressid: that.myaddress.id,
                    formlist: JSON.stringify(list)
                }, function(succeed, data, err) {
                    if (succeed) {
                        if (data.idlist.length == 1) {
                            that.open_orderpay(data.idlist[0]);
                            return;
                        }
                        if (data.idlist.length > 1) {
                            ns.openWin('myorderlist_frm', '待付款订单', {
                                title: '待付款订单',
                                url: 'myorderlist_frm.html',
                                status: 1
                            }, {
                                needlogin: true
                            })
                            return;
                        }
                        api.toast({
                            msg: '创建订单失败，请稍后再尝试购买',
                            duration: 2000,
                            location: 'bottom'
                        });
                    } else {
                        api.toast({
                            msg: err,
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                });
                return;
            }
            if (that.order_type == 6) {
                ns.post({
                    action: 'createpintuanorder',
                    orderid: that.orderid,
                    user_note: that.user_note,
                    addressid: that.myaddress.id,
                    couponid: that.couponform.couponid,
                    couponuserid: that.couponform.id,
                    couponprice: that.couponform.price,
                    shiprateid: that.shiprate.id,
                    shipratename: that.shiprate.name,
                    shiprateamount: that.shiprate.amount,
                    shipratetype: that.shiprate.RateType
                }, function(succeed, data, err) {
                    if (succeed) {
                        that.open_orderpay(data.id);
                    } else {
                        api.toast({
                            msg: err,
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                });
                return;
            }
            if (that.order_type == 14) {
                ns.post({
                    action: 'createhouseserviceorder',
                    id: that.houseserviceid,
                    user_note: that.user_note,
                    addressid: that.myaddress.id,
                    couponid: that.couponform.couponid,
                    couponuserid: that.couponform.id,
                    couponprice: that.couponform.price,
                    variantid: that.variantid,
                    quantity: that.quantity
                }, function(succeed, data, err) {
                    if (succeed) {
                        that.open_orderpay(data.id);
                    } else {
                        api.toast({
                            msg: err,
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                });
                return;
            }
        },
        open_orderpay: function(orderid) {
            var that = this;
            api.sendEvent({
                name: 'on_open_orderpay',
            });
            var name = 'dl_orderpay_frm';
            api.openFrame({
                name: name,
                url: name + '.html',
                bounces: false,
                pageParam: {
                    paymentid: that.paymentid,
                    id: orderid
                },
                rect: {
                    x: 0,
                    y: 0,
                    w: 'auto',
                    h: 'auto',
                    marginBottom: 0
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    UIMultiSelector = api.require('UIMultiSelector');
    ns = window.Foresight.Util;
    app.order_type = api.pageParam.type;
    app.buytype = api.pageParam.buytype || 16;
    app.quantity = api.pageParam.quantity || 1;
    app.productid = api.pageParam.productid || 0;
    app.variantid = api.pageParam.variantid || 0;
    app.paymentid = api.pageParam.paymentid || 0;
    app.cartidlist = api.pageParam.cartids || '';
    app.orderid = api.pageParam.orderid;
    app.houseserviceid = api.pageParam.houseserviceid;
    app.get_data();
    api.addEventListener({
        name: 'selected_address_id_complete'
    }, function() {
        api.getPrefs({
            key: 'selected_address_id'
        }, function(ret, err) {
            if (ret && ret.value && ret.value != '') {
                app.get_address_info(ret.value);
            }
        });
    });
    api.addEventListener({
        name: 'do_close_orderconfirm'
    }, function(ret, err) {
        api.closeWin();
    });
};
