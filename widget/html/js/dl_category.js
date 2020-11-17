var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        menus: [],
        sub_menus: [],
        list: [],
        categoryid: 0,
        parentid: 0,
        tagid: 0,
        form: {
            pageindex: 0,
            pagesize: 10,
            keywords: ''
        },
        current_item_length: 0,
        is_searching: false,
        scroll_top: 0,
        can_scroll: true,
        sortorders: [{
            title: '默认',
            index: 5,
            is_active: true
        }, {
            title: '最新',
            index: 1,
            is_active: false
        }, {
            title: '销量',
            index: 2,
            is_active: false
        }, {
            title: '价格',
            index: 3,
            is_active: false,
            sort_by_price: 1
        }, ],
        get_category: 1,
        current_sortby: 5,
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
            show_buynow: false,
            is_addtocard: false,
            is_buynow: false,
            has_variants: false,
            product_invalid: false,
            product_offline: false,
            totalcount: 0
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            that.can_scroll = false;
            var options = {};
            options.action = 'getproductlistbycategoryid';
            options.pageindex = that.form.pageindex;
            options.pagesize = that.form.pagesize;
            options.get_category = that.get_category;
            options.categoryid = that.categoryid;
            options.parentid = that.parentid;
            options.sortby = that.current_sortby;
            options.type = 'productcategory';
            options.keywords = that.form.keywords;
            options.ProductTypeID = 1;
            options.IsAllowProductBuy = 1;
            options.tagid = that.tagid;
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    if (that.get_category == 1) {
                        that.menus = data.menus;
                    }
                    if (data.list.length == that.form.pagesize) {
                        that.can_scroll = true;
                    }

                    if (that.form.pageindex == 0) {
                        that.list = data.list;
                    } else {
                        that.list = that.list.concat(data.list);
                    }
                    app.current_item_length = that.list.length;
                    that.get_category = 0;
                    setTimeout(function() {
                        that.do_scroll_left();
                        that.reset_refresh_box();
                    }, 2000);
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
        get_submenu: function() {
            var that = this;
            var options = {};
            options.action = 'gettaglistbycategoryid';
            options.categoryid = that.categoryid;
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    that.sub_menus = data.sub_menus;
                } else if (err) {
                    that.sub_menus = [];
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_scroll_left: function() {
            var that = this;
            var scroll_left = 0;
            var is_arrive = false;
            for (var i = 0; i < that.menus.length; i++) {
                var item = that.menus[i];
                item.is_active = false;
                if (item.id == that.categoryid) {
                    item.is_active = true;
                    document.getElementById('main_menus').scrollLeft = scroll_left;
                    is_arrive = true;
                    continue;
                }
                if (!is_arrive) {
                    var width = document.getElementById('label_' + item.id).offsetWidth;
                    scroll_left += width + 10;
                }
            }
        },
        search_sort: function(item) {
            var that = this;
            for (var i = 0; i < that.sortorders.length; i++) {
                that.sortorders[i].is_active = false;
            }
            item.is_active = true;
            that.current_sortby = item.index;
            if (item.index == 3) {
                if (item.sort_by_price == 1 || item.sort_by_price == 3) {
                    item.sort_by_price = 2;
                    that.current_sortby = 4;
                } else {
                    item.sort_by_price = 3;
                    that.current_sortby = 3;
                }
            } else {
                that.sortorders[2].sort_by_price = 1;
            }
            that.form.pageindex = 0;
            that.get_data();
        },
        open_win: function(item) {
            var that = this;
            ns.openWin('dl_product_frm', item.title, {
                id: item.id,
            });
        },
        do_search_top_menu: function(item) {
            var that = this;
            for (var i = 0; i < that.menus.length; i++) {
                that.menus[i].is_active = false;
            }
            item.is_active = true;
            that.categoryid = item.id;
            that.tagid = 0;
            that.form.pageindex = 0;
            that.get_data();
            that.get_submenu();
        },
        do_search_sub_menu: function(item) {
            var that = this;
            for (var i = 0; i < that.sub_menus.length; i++) {
                that.sub_menus[i].is_active = false;
            }
            item.is_active = true;
            that.tagid = item.id;
            that.form.pageindex = 0;
            that.get_data();
        },
        reset_refresh_box: function() {
            var that = this;
            var main_refresh = $api.byId('main_refresh');
            var top_menus = $api.byId('top_menus');
            var top_menus_h = $api.offset(top_menus).h;
            $api.css(main_refresh, 'margin-top:' + top_menus_h + 'px');
        },
        hide_buybox: function() {
            var that = this;
            that.cart_form.show_buynow = false;
        },
        add_to_cart: function(item) {
            var that = this;
            var options = {};
            options.id = item.id;
            options.action = 'getmallproductdetail';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    if (!data.status) {
                        if (data.code == 1) {
                            that.cart_form.product_invalid = true;
                        } else if (data.code == 2) {
                            that.cart_form.product_offline = true;
                        }
                        return;
                    }
                    that.cart_form.productinfo = data.productinfo;
                    that.cart_form.productvariants = data.productvariants;
                    that.cart_form.has_variants = data.has_variants;
                    that.cart_form.totalcount = data.totalcount;
                    that.do_addtocart();
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_addtocart: function() {
            var that = this;
            that.cart_form.is_addtocard = true;
            that.cart_form.is_buynow = false;
            if (that.cart_form.show_buynow) {
                that.do_check_roomstatus();
                return;
            }
            that.cart_form.show_buynow = true;
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
            that.cart_form.show_buynow = false;
            ns.post({
                action: 'checkconnectroom'
            }, function(succeed, data, err) {
                if (succeed) {
                    that.do_confirm_addtocart();
                } else if (err) {
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
                if (succeed) {
                    that.cart_form.totalcount = data.total;
                    api.toast({
                        msg: '添加成功',
                        duration: 2000,
                        location: 'bottom'
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
                current.selected = false;
                if (current.id == item.id) {
                    if (that.cart_form.productinfo.isallowpointbuy) {
                        that.cart_form.productinfo.pricedesc = '￥' + item.price.toFixed(2) + ' + ' + item.salepoint + '积分';
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
    app.categoryid = api.pageParam.id;
    app.form.keywords = api.pageParam.keywords || ''
    app.parentid = api.pageParam.parentid;
    if (app.categoryid > 0) {
        app.get_submenu();
    }
    app.get_data();
    api.sendEvent({
        name: 'do_search_start'
    });
    var pullRefresh = new auiPullToRefresh({
        container: document.querySelector('.aui-refresh-content'),
        triggerDistance: 100
    }, function(ret) {
        if (ret.status == "success") {
            setTimeout(function() {
                app.form.pageindex = 0;
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
            app.form.pageindex = app.current_item_length;
            app.get_data();
        }
    });
};
