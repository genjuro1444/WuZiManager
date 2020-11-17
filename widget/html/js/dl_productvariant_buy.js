var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        cart_form: {
            productinfo: {
                id: 0,
                title: '',
                summary: '',
                saleprice: 0,
                cost: 0,
                sellcount: '',
                delivery_type: '',
                description: '',
                imageurl: '../image/error-img.png',
                variantid: 0,
                quantity: 1,
                variantname: ''
            },
            productvariants: {
                title: '',
                list: []
            },
            is_addtocard: false,
            is_buynow: false,
            has_variants: false,
            product_invalid: false,
            product_offline: false,
            totalcount: 0
        }
    },
    methods: {
        hide_buybox: function() {
            api.setFrameAttr({
                rect: {
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0
                }
            });
        },
        get_data: function() {
            var that = this;
            if (!that.cart_form.productinfo.id) {
                return;
            }
            var options = {};
            options.id = that.cart_form.productinfo.id;
            options.action = 'getmallproductdetail';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    //alert(JSON.stringify(data.productvariants));
                    that.cart_form.productinfo = data.productinfo;
                    that.cart_form.productvariants = data.productvariants;
                    that.cart_form.has_variants = data.has_variants;
                    that.cart_form.totalcount = data.totalcount;
                    if (that.cart_form.productvariants.list.length > 0) {
                        that.do_variant_select(that.cart_form.productvariants.list[0]);
                    }
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_check_roomstatus: function() {
            var that = this;
            if (that.cart_form.has_variants && that.cart_form.productinfo.variantid == 0) {
                api.toast({
                    msg: '请选择' + that.cart_form.productvariants.title,
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            toast.loading({
                title: '提交中',
                duration: 2000
            }, function(ret) {});
            ns.post({
                action: 'checkconnectroom'
            }, function(succeed, data, err) {
                if (succeed) {
                    if (that.cart_form.is_buynow) {
                        that.do_confirm_buy();
                    } else if (that.cart_form.is_addtocard) {
                        that.do_confirm_addtocart();
                    }
                } else if (err) {
                    toast.hide();
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_confirm_addtocart: function() {
            var that = this;
            var options = {};
            options.productid = that.cart_form.productinfo.id;
            options.variantid = that.cart_form.productinfo.variantid;
            options.quantity = that.cart_form.productinfo.quantity;
            options.action = 'addproducttocart';
            ns.post(options, function(succeed, data, err) {
                toast.hide();
                if (succeed) {
                    that.cart_form.totalcount = data.total;
                    api.toast({
                        msg: '添加成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    api.sendEvent({
                        name: 'do_getshopingcart_count',
                    });
                    setTimeout(function() {
                        that.hide_buybox();
                    }, 500)
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_confirm_buy() {
            var that = this;
            if (that.cart_form.has_variants && that.cart_form.productinfo.variantid == 0) {
                toast.hide();
                api.toast({
                    msg: '请选择' + that.productvariants.title,
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            var options = {};
            options.productid = that.cart_form.productinfo.id;
            options.variantid = that.cart_form.productinfo.variantid;
            options.quantity = that.cart_form.productinfo.quantity;
            options.action = 'checkproductinventory';
            ns.post(options, function(succeed, data, err) {
                toast.hide();
                if (succeed) {
                    ns.openWin('dl_neworder_frm', '订单确认', {
                        productid: that.cart_form.productinfo.id,
                        variantid: that.cart_form.productinfo.variantid,
                        buytype: that.cart_form.productinfo.type,
                        quantity: that.cart_form.productinfo.quantity,
                        type: 2 //直接购买商品
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
        do_variant_select: function(item) {
            var that = this;
            for (var i = 0; i < that.cart_form.productvariants.list.length; i++) {
                var current = that.cart_form.productvariants.list[i];
                if (current.id == 0) {
                    continue;
                }
                current.selected = false;
                if (current.id == item.id) {
                    if (that.cart_form.productinfo.isallowpointbuy) {
                        // that.cart_form.productinfo.pricedesc = '￥' + item.price.toFixed(2) + ' + ' + item.salepoint + '积分';
                        that.cart_form.productinfo.pricedesc = '￥' + item.price.toFixed(2);
                    } else {
                        that.cart_form.productinfo.pricedesc = '￥' + item.price.toFixed(2);
                    }
                    that.cart_form.productinfo.saleprice = item.price;
                    that.cart_form.productinfo.salepoint = item.salepoint;
                    that.cart_form.productinfo.variantid = item.id;
                    that.cart_form.productinfo.variantname = item.name;
                    that.cart_form.productinfo.quantitylimit = item.quantitylimit;
                }
            }
            item.selected = true;
        },
        add_count: function() {
            var that = this;
            if (that.cart_form.productinfo.quantity == that.cart_form.productinfo.quantitylimit) {
                api.toast({
                    msg: '此商品限购' + that.cart_form.productinfo.quantitylimit + '个',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.cart_form.productinfo.quantity >= that.cart_form.productinfo.maxquantity) {
                return;
            }
            that.cart_form.productinfo.quantity++;
        },
        reduce_count: function() {
            var that = this;
            if (that.cart_form.productinfo.quantity <= 1) {
                return;
            }
            that.cart_form.productinfo.quantity--;
        },
        do_quantity_change: function() {
            var that = this;
            if (that.cart_form.productinfo.quantity < 1) {
                that.cart_form.productinfo.quantity = 1;
                return;
            }
            if (that.cart_form.productinfo.quantity > that.cart_form.productinfo.maxquantity) {
                that.cart_form.productinfo.quantity = that.cart_form.productinfo.maxquantity;
                return;
            }
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.cart_form.productinfo.id = api.pageParam.id;
    app.cart_form.is_buynow = api.pageParam.isbuy || false;
    app.cart_form.is_addtocard = api.pageParam.isaddcart || false;
    app.get_data();
    api.addEventListener({
        name: 'reloadproductvariantbuy'
    }, function(ret, err) {
        app.cart_form.productinfo.id = ret.value.id || 0;
        app.cart_form.is_buynow = ret.value.isbuy || false;
        app.cart_form.is_addtocard = ret.value.isaddcart || false;
        if (app.cart_form.productinfo.id > 0) {
            app.cart_form.productvariants = [];
            app.cart_form.has_variants = false;
            app.cart_form.totalcount = 0;
            app.get_data();
        }
    });
};
