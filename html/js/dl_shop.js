var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        businessinfo: {
            id: 0,
            title: '',
            rate: '',
            address: '',
            distance: '',
            coverimage: '../image/shop_pic.jpg',
            is_ziying: true
        },
        is_searching: false,
        categorylist: [],
        productlist: []
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            var options = {};
            options.action = 'getbusinessinfobyid';
            options.ID = that.businessinfo.id;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.businessinfo = data.businessinfo;
                    that.categorylist = data.categorylist;
                    that.productlist = data.productlist;
                    if (that.categorylist.length > 0) {
                        that.get_product_data(that.categorylist[0]);
                    }
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                    setTimeout(function() {
                        api.closeWin();
                    }, 500)
                }
            }, {
                toast: true
            });
        },
        get_product_data: function(item) {
            var that = this;
            for (var i = 0; i < that.categorylist.length; i++) {
                that.categorylist[i].is_active = false;
            }
            item.is_active = true;
            that.list = [];
            for (var i = 0; i < that.productlist.length; i++) {
                var sp = that.productlist[i];
                if (sp.categoryidlist.indexOf(item.id) > -1) {
                    that.list.push(sp);
                    continue;
                }
            }
        },
        open_win: function(item) {
            var that = this;
            var title = '商品详情';
            var id = 0;
            if (item) {
                title = item.title;
                id = item.id;
            }
            ns.openWin('dl_product_frm', title, {
                id: id,
            });
        },
        scrollPage: function(scrollTop) {
            var that = this;
            var header_h = api.pageParam.header_h || 0;
            var elem = $api.byId('sp_product_main');
            var elemOffset = $api.offset(elem);
            var top = scrollTop - elemOffset.t;
            if (top > 0) {
                $api.addCls(elem, 'posfixed');
                var winHeight = api.winHeight - header_h;
                // var winHeight = 200;
                var elemUlLeft = $api.byId('sp_pro_lft_ul');
                var elemUlRight = $api.byId('sp_pro_right_ul');
                $api.css(elemUlLeft, 'height:' + winHeight + 'px');
                $api.css(elemUlRight, 'height:' + winHeight + 'px');
                elemUlLeft.onscroll = function() {
                    var leftTop = $api.offset($api.byId('sp_pro_left_ul_li_0')).t;
                    if (leftTop == 0) {
                        $api.removeCls(elem, 'posfixed');
                        $api.css(elemUlLeft, 'height: auto');
                        $api.css(elemUlRight, 'height: auto');
                    }
                }
                elemUlRight.onscroll = function() {
                    var rightTop = $api.offset($api.byId('sp_pro_right_ul_li_0')).t;
                    console.log(rightTop);
                    if (rightTop == 0) {
                        $api.removeCls(elem, 'posfixed');
                        $api.css(elemUlLeft, 'height: auto');
                        $api.css(elemUlRight, 'height: auto');
                    }
                }
            } else {

            }
        },
        open_win: function(item) {
            var that = this;
            var name = 'dl_product_frm';
            ns.openWin(name, item.title, {
                id: item.id,
                type: 16
            });
        },
        doOpenAddCart: function(id) {
            var name = 'dl_productvariant_buy_frm';
            api.openFrame({
                name: name,
                url: name + '.html',
                bounces: false,
                pageParam: {
                    id: id,
                    isaddcart: true
                },
                rect: {
                    x: 0,
                    y: 0,
                    w: 'auto',
                    h: 'auto',
                    marginBottom: 0
                }
            });
            api.sendEvent({
                name: 'reloadproductvariantbuy',
                extra: {
                    id: id,
                    is_buynow: false,
                    isaddcart: true,
                }
            });
        },
        doOpenDriveMap: function() {
            var that = this;
            if (that.businessinfo.lon == 0 || that.businessinfo.lat == 0) {
                return;
            }
            var name = 'dl_mapdrive_frm';
            api.openFrame({
                name: name,
                url: name + '.html',
                bounces: false,
                pageParam: {
                    lon: that.businessinfo.lon,
                    lat: that.businessinfo.lat,
                    title: that.businessinfo.title,
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
        open_call: function() {
            var that = this;
            if (!that.businessinfo.phonenumber) {
                return;
            }
            ns.confirmPer('phone', function() {
                api.call({
                    type: 'tel_prompt',
                    number: that.businessinfo.phonenumber
                });
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.businessinfo.id = api.pageParam.id;
    app.get_data();
};
var scroll = new auiScroll({
    listen: true,
    distance: 0 //判断到达底部的距离，isToBottom为true
}, function(ret) {
    app.scrollPage(ret.scrollTop);
});
