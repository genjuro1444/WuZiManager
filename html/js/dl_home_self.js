var ns;
var app = new Vue({
    el: '#app',
    data: {
        not_login: true,
        userinfo: {
            headimg: '../image/default_user.png',
            username: '',
            phonenumber: '',
            amount_balance: '0.00',
            point_balance: 0,
            fushun_balance: 0,
            isselfuser: false,
            fushun_coupon: '0张',
            userlevelid: 0,
            levelname: '',
            mallname: '积分商城'
        },
        form: {
            css: 'aui-col-xs-4'
        },
        hotline: '',
        imageurl: '',
        show_door: false,
        appVersion: '',
        cartcount: 1
    },
    methods: {
        get_data: function() {
            var that = this;
            that.get_rotating_images();
            setTimeout(function() {
                that.get_userinfo();
            }, 500);
            setTimeout(function() {
                that.get_hotline();
            }, 1000);
        },
        get_rotating_images: function() {
            var that = this;
            ns.post({
                action: 'getrotatingimages',
                type: 3,
            }, function(succeed, data, err) {
                if (succeed) {
                    if (data.imagelist.length > 0) {
                        that.imageurl = data.imagelist[0].imageurl;
                    }
                }
            });
        },
        get_hotline: function() {
            var that = this;
            ns.post({
                action: 'getmallhotline'
            }, function(succeed, data, err) {
                if (succeed) {
                    that.hotline = data.hotline;
                }
            });
        },
        open_balance: function() {
            var that = this;
            var name = 'amount_balance_frm';
            ns.openWin(name, '', {
                title: '',
                url: name + '.html',
                type: 12
            }, {
                needroom: true
            });
        },

        open_coupon: function() {
            var that = this;
            var name = 'mycoupon_frm';
            var title = '优惠券';
            ns.openWin(name, title, null, {
                needroom: true
            });
        },
        open_pointmall: function() {
            var that = this;
            var title = that.userinfo.mallname;
            var name = 'point_mall_frm';
            var type = 13;
            if (that.userinfo.userlevelid > 0) {
                type = 20;
            }
            ns.openWin(name, title, {
                title: title,
                url: name + '.html',
                type: type,
                searchtype: 3
            }, {
                needlogin: true
            });
        },
        open_win: function(title, name, needroom) {
            var that = this;
            if (needroom) {
                ns.openWin(name, title, null, {
                    needroom: true
                });
                return;
            }
            ns.openWin(name, title, null, {
                needlogin: true
            });
        },
        open_about_us: function(title, name) {
            ns.openWin(name, title, {
                title: title,
                url: name + '.html',
                type: 19
            });
        },
        open_myinfo: function() {
            var that = this;
            ns.openWin('dl_myinfo_frm', '个人信息', {
                id: 0,
            });
        },
        open_point: function() {
            var that = this;
            ns.openWin('dl_point_frm', '我的家庭积分', {
                id: 0,
            });
        },
        open_youhuiquan: function() {
            var that = this;
            ns.openWin('dl_mycoupon_frm', '我的优惠券', {
                id: 0,
            });
        },
        open_huiyuan: function() {
            var that = this;
            ns.openWin('dl_huiyuan_card', '会员卡', {
                id: 0,
            });
        },
        open_shouhuodz: function(item) {
            var that = this;
            ns.openWin('dl_shouhuodizhi_frm', '收货地址', {
                id: 0,
            });
        },
        open_gouwuche: function(item) {
            var that = this;
            ns.openWin('dl_gouwuche_frm', '购物车');
        },
        open_myorder: function(item) {
            var that = this;
            ns.openWin('dl_myorder_frm', '我的账单', {
                id: 0,
            });
        },
        open_myfamily: function(item) {
            var that = this;
            ns.openWin('dl_myfamily_frm', '我的家庭组', {
                id: 0,
            });
        },
        open_xiaoqu: function(item) {
            var that = this;
            ns.openWin('dl_myxiaoqu_frm', '我的小区', {
                id: 0,
            });
        },
        open_myseting: function(item) {
            var that = this;
            ns.openWin('dl_mysetting_frm', '系统设置', {
                id: 0,
            });
        },
        open_login: function() {
            ns.openWin('dl_login_frm', '登录');
        },
        get_userinfo: function() {
            var that = this;
            ns.post({
                action: 'getuserandbalanceinfo'
            }, function(succeed, data, err) {
                if (succeed) {
                    that.userinfo = data;
                    if (data.headimg) {
                        that.image_cache(data.headimg);
                    }
                    that.not_login = false;
                } else if (err) {
                    that.not_login = true;
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                    that.userinfo.headimg = '../image/default_user.png';
                    that.userinfo.username = '';
                    that.userinfo.phonenumber = '';
                    that.userinfo.amount_balance = '0.00';
                    that.userinfo.point_balance = 0;
                    that.userinfo.fushun_balance = 0;
                    that.userinfo.isselfuser = false;
                    that.userinfo.fushun_coupon = '0张';
                }
                if (that.userinfo.isselfuser) {
                    that.form.css = "aui-col-xs-3";
                } else {
                    that.form.css = "aui-col-xs-4";
                }
            });
        },
        image_cache: function(url) {
            var that = this;
            that.userinfo.headimg = url;
            api.imageCache({
                url: url,
                thumbnail: false
            }, function(ret, err) {
                if (ret.status) {
                    that.userinfo.headimg = ret.url;
                }
            });
        },
        open_orderlist: function(index) {
            var that = this;
            ns.openWin('dl_orderlistwin_frm', '订单中心', {
                tabIndex: index
            });
        },
        open_call: function() {
            var that = this;
            ns.confirmPer('phone', function() {
                api.call({
                    type: 'tel_prompt',
                    number: that.hotline
                });
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
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
    api.addEventListener({
        name: 'do_getshopingcart_count'
    }, function() {
        setTimeout(function() {
            app.get_cart_count();
        }, 500);
    });
    setTimeout(function() {
        app.get_cart_count();
    }, 1000)
    var pullRefresh = new auiPullToRefresh({
        container: document.querySelector('.aui-refresh-content'),
        triggerDistance: 100
    }, function(ret) {
        if (ret.status == "success") {
            setTimeout(function() {
                app.get_data();
                pullRefresh.cancelLoading(); //刷新成功后调用此方法隐藏
            }, 1500)
        }
    })
    api.addEventListener({
        name: 'onlogin'
    }, function() {
        app.not_login = false;
        app.get_userinfo();
    });
    api.addEventListener({
        name: 'open_setting'
    }, function() {
        app.open_win('系统设置', 'mysetting_frm');
    });
    api.addEventListener({
        name: 'logout_complete'
    }, function() {
        app.get_userinfo();
    });
    api.addEventListener({
        name: 'changeuserinfosuccess'
    }, function() {
        app.get_userinfo();
    });
    app.appVersion = api.appVersion;
};
