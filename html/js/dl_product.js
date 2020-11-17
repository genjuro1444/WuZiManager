var ns, imageBrowser;
var app = new Vue({
    el: '#app',
    data: {
        productinfo: {
            type: 0,
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
            variantname: '',
            producttypeid: 0,
            joincount: 0,
            leftcount: 0,
            countdownenable: false,
            countdowndesc: '',
            countdowndate: '',
            countdownday: ''
        },
        productimages: [],
        productvariants: {
            title: '',
            list: []
        },
        has_variants: false,
        product_invalid: false,
        product_offline: false,
        totalcount: 0,
        commentlist: [],
        hasratelist: true,
        leftTime: 0,
        couponlist: [],
        commentTotal: 0,
        cartcount: 0
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.id = that.productinfo.id;
            options.action = 'getmallproductdetail';
            ns.post(options, function(succeed, data, err) {
                //alert(JSON.stringify(data));
                if (succeed) {
                    if (!data.status) {
                        if (data.code == 1) {
                            that.product_invalid = true;
                        } else if (data.code == 2) {
                            that.product_offline = true;
                        }
                        return;
                    }

                    //alert(JSON.stringify(data.commentlist));
                    that.productinfo = data.productinfo;
                    that.productimages = data.productimages;
                    that.has_variants = data.has_variants;
                    that.totalcount = data.totalcount;
                    that.commentlist = data.commentlist;
                    that.hasratelist = (that.commentlist && that.commentlist.length > 0);
                    setTimeout(function() {
                        that.slider_work();
                    }, 200);
                    that.couponlist = data.couponlist;
                    that.commentTotal = data.commentTotal;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        get_coupon_list: function() {
            var that = this;
            var options = {};
            options.productid = that.productinfo.id;
            options.action = 'gettakecouponlist';
            options.CouponType = 1;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.couponlist = data.couponlist;
                    that.productinfo.hascoupon = data.hascoupon;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_take_coupon: function(item) {
            var that = this;
            if (item.istaken) {
                return;
            }
            var options = {};
            options.couponid = item.id;
            options.action = 'takemallcoupon';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '领取成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    that.get_coupon_list();
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        slider_work: function() {
            var that = this;
            var slide = new auiSlide({
                container: document.getElementById("aui-slide"),
                "height": 300,
                "speed": 500,
                "autoPlay": 3000, //自动播放
                "loop": true,
                "pageShow": true,
                "pageStyle": 'dot',
                'dotPosition': 'top'
            })
        },
        open_shoppingcart: function() {
            var that = this;
            ns.openWin('shoppingcart_frm', '我的购物车', null, {
                needroom: true
            });
        },
        get_cart_count: function() {
            var that = this;
            var options = {};
            options.action = 'getshoppingcartitemcount';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.cartcount = data.total;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        img_browser: function(index) {
            var that = this;
            var imgurls = [];
            for (var i = 0; i < that.productimages.length; i++) {
                imgurls.push(that.productimages[i].largeimage);
            }
            imageBrowser.openImages({
                imageUrls: imgurls,
                showList: false,
                activeIndex: index
            });
        },
        open_chat: function() {
            var that = this;
            var name = 'dl_message_chatdetail_frm';
            var title = '在线聊天';
            ns.openWin(name, title, {
                productid: that.productinfo.id
            }, {
                needlogin: true
            })
        },
        open_business: function() {
            var that = this;
            var name = 'dl_shop_frm';
            var id = that.productinfo.businessid;
            ns.openWin(name, that.productinfo.businessname, {
                title: that.productinfo.businessname,
                url: name + '.html',
                id: id
            });
        },
        do_open_variant: function(isbuy, isaddcart) {
            var that = this;
            var name = 'dl_productvariant_buy_frm';
            api.setFrameAttr({
                name: name,
                rect: {
                    x: 0,
                    y: 0,
                    w: 'auto',
                    h: 'auto'
                }
            });
            api.sendEvent({
                name: 'reloadproductvariantbuy',
                extra: {
                    id: that.productinfo.id,
                    isaddcart: isaddcart,
                    isbuy: isbuy
                }
            });
        },
        doOpenVariantSelect: function() {
            var that = this;
            var name = 'dl_productvariant_buy_frm';
            api.openFrame({
                name: name,
                url: name + '.html',
                bounces: false,
                pageParam: {
                    id: that.productinfo.id,
                    isaddcart: false,
                    isbuy: false
                },
                rect: {
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0,
                    marginBottom: 0
                }
            });
        },
        open_chat: function() {
            var that = this;
            ns.openWin('dl_messagelist_frm', '消息中心', {
                title: '消息中心',
                url: 'dl_messagelist_frm.html',
                id: 0
            });
        },
        open_cart: function() {
            var that = this;
            ns.openWin('dl_gouwuche_frm', '购物车', {
                title: '购物车',
                url: 'dl_gouwuche_frm.html',
                id: 0,
                ismain: true,
                needlogin: true
            });
        },
        open_OrderComments_win: function() {
            var that = this;
            ns.openWin('dl_pingjialist_frm', '评论列表', {
                title: '评论列表',
                url: 'dl_pingjialist_frm.html',
                id: that.productinfo.id,
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    imageBrowser = api.require('imageBrowser');
    app.productinfo.id = api.pageParam.id || 0;
    app.get_data();
    setTimeout(function() {
        app.get_cart_count();
    }, 1000)
    setTimeout(function() {
        app.doOpenVariantSelect();
    }, 100)
};
