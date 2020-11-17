var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        cartlist: [],
        productsummary: {
            totaldesc: '',
            totalprice: 0,
            totalsalepoint: 0,
        },
        allchecked: false,
        is_searching: false,
        selectidlist: []
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            var options = {};
            options.action = 'getshoppingcartlist';
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    that.cartlist = data.cartlist;
                    // that.productsummary = data.ordersummary;
                } else if (err) {
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
        calculate_total: function() {
            var that = this;
            var totalprice = 0;
            var totalsalepoint = 0;
            for (var i = 0; i < that.cartlist.length; i++) {
                var current = that.cartlist[i];
                for (var j = 0; j < current.productlist.length; j++) {
                    var current2 = current.productlist[j];
                    if (current2.checked) {
                        totalprice += current2.price * current2.quantity;
                        totalsalepoint += current2.salepoint * current2.quantity;
                    }
                }
            }
            that.productsummary.totalprice = totalprice;
            that.productsummary.totalsalepoint = totalsalepoint;
            if (totalprice > 0 && totalsalepoint > 0) {
                that.productsummary.totaldesc = "￥" + totalprice.toFixed(2) + " + " + totalsalepoint + "积分";
            } else if (totalprice > 0) {
                that.productsummary.totaldesc = "￥" + totalprice.toFixed(2);
            } else if (totalsalepoint > 0) {
                that.productsummary.totaldesc = totalsalepoint + "积分";
            } else {
                that.productsummary.totaldesc = '￥0.00';
            }
        },
        reduce_count: function(item) {
            var that = this;
            if (item.quantity == 1) {
                that.do_remove(item);
                return;
            }
            item.quantity--;
            that.calculate_total();
            that.update_quantity(item);
        },
        add_count: function(item) {
            var that = this;
            var options = {};
            options.productid = item.productid;
            options.variantid = item.variantid;
            options.quantity = (item.quantity + 1);
            options.action = 'checkproductinventory';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    item.quantity++;
                    that.calculate_total();
                    that.update_quantity(item);
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_quantity_change: function(item) {
            var that = this;
            if (item.quantity < 1) {
                item.quantity = 1;
                return;
            }
            if (item.quantity >= item.maxquantity) {
                item.quantity = item.maxquantity;
                return;
            }
            that.calculate_total();
            that.update_quantity(item);
        },
        update_quantity: function(item) {
            var that = this;
            var options = {};
            options.action = 'updateshoppingcartquantity';
            options.id = item.id;
            options.quantity = item.quantity;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    api.sendEvent({
                        name: 'do_getshopingcart_count',
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
        do_select: function(item) {
            var that = this;
            item.checked = !item.checked;
            var all_checked = true;
            for (var i = 0; i < that.cartlist.length; i++) {
                var current = that.cartlist[i];
                for (var j = 0; j < current.productlist.length; j++) {
                    var current2 = current.productlist[j];
                    if (!current2.checked) {
                        all_checked = false;
                        break;
                    }
                }
            }
            that.allchecked = all_checked;
            that.calculate_total();
        },
        do_select_business: function(item) {
            var that = this;
            item.business.ischecked = !item.business.ischecked;
            for (var i = 0; i < item.productlist.length; i++) {
                var current = item.productlist[i];
                current.checked = item.business.ischecked;
            }
            var all_checked = true;
            for (var i = 0; i < that.cartlist.length; i++) {
                var current = that.cartlist[i];
                for (var j = 0; j < current.productlist.length; j++) {
                    var current2 = current.productlist[j];
                    if (!current2.checked) {
                        all_checked = false;
                        break;
                    }
                }
            }
            that.allchecked = all_checked;
            that.calculate_total();
        },
        select_all: function() {
            var that = this;
            that.allchecked = !that.allchecked;
            for (var i = 0; i < that.cartlist.length; i++) {
                var current = that.cartlist[i];
                current.business.ischecked = that.allchecked;
                for (var j = 0; j < current.productlist.length; j++) {
                    var current2 = current.productlist[j];
                    current2.checked = that.allchecked;
                }
            }
            that.calculate_total();
        },
        do_remove: function(item) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确认删除该商品?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    var options = {};
                    options.action = 'removeshoppingcart';
                    options.id = item.id;
                    ns.post(options, function(succeed, data, err) {
                        if (succeed) {
                            that.get_data();
                        } else if (err) {
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
        do_remove_selected: function() {
            var that = this;
            that.get_selected_idlist();
            if (that.selectidlist.length == 0) {
                api.toast({
                    msg: '请勾选商品',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            api.confirm({
                title: '提示',
                msg: '确认删除选中的商品?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    var options = {};
                    options.action = 'removeshoppingcart';
                    options.ids = JSON.stringify(idlist);
                    ns.post(options, function(succeed, data, err) {
                        if (succeed) {
                            that.get_data();
                        } else if (err) {
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
        get_selected_idlist: function() {
            var that = this;
            that.selectidlist = [];
            for (var i = 0; i < that.cartlist.length; i++) {
                var current = that.cartlist[i];
                for (var j = 0; j < current.productlist.length; j++) {
                    var current2 = current.productlist[j];
                    if (current2.checked) {
                        if (current2.quantitylimit > 0) {
                            if ((current2.quantity + current2.mybuyquantity) > current2.quantitylimit) {
                                api.toast({
                                    msg: '商品' + current2.title + '限购' + current2.quantitylimit + '个',
                                    duration: 2000,
                                    location: 'bottom'
                                });
                                return false;
                            }
                        }
                        if (current2.quantity > current2.maxquantity) {
                            api.toast({
                                msg: '商品' + current2.title + '只有' + current2.maxquantity + '个库存',
                                duration: 2000,
                                location: 'bottom'
                            });
                            return false;
                        }
                        that.selectidlist.push(current2.id);
                    }
                }
            }
            return true;
        },
        do_pay: function() {
            var that = this;
            if (!that.get_selected_idlist()) {
                return;
            }
            if (that.selectidlist.length == 0) {
                api.toast({
                    msg: '请勾选商品',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            //2019-07-22修改
            ns.post({
                action: 'checkproductinventory',
                cartids: JSON.stringify(that.selectidlist),
            }, function(succeed, data, err) {
                if (succeed) {
                    ns.openWin('dl_neworder_frm', '订单确认', {
                        cartids: JSON.stringify(that.selectidlist),
                        type: 4
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
        open_product: function(item) {
            var that = this;
            ns.openWin('dl_product_frm', item.title, {
                id: item.productid,
                type: item.ProductOrderType
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.get_data();
    api.addEventListener({
        name: 'on_open_orderpay'
    }, function() {
        setTimeout(function() {
            api.closeWin();
        }, 500);
    });
};
