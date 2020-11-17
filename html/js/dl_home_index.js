var ns, app, timer, marqueesHeight, slide,
    stopscroll, scrollElem, preTop, currentTop, stoptime, leftElem, popup, heightArray = [];
app = new Vue({
    el: '#app',
    data: {
        domainURL: CONFIG.url,
        city: '',
        imagelist: [],
        newslist: [{
            title: '端午节活动安排',
        }],
        servicelist: [{
                title: '物业缴费',
                name: 'dl_wyjiaofei_frm',
                require_login: false,
                css: 'icon-jiaofei',
                src: '../image/icons/wyejiaofei_icon_new.png'
            }, {
                title: '投诉建议',
                name: 'dl_tousujylist_frm',
                require_login: false,
                css: '',
                src: '../image/icons/tousujianyi_icon_new.png'
            }, {
                title: '报事报修',
                name: 'dl_bsbxlist_frm',
                require_login: false,
                css: 'icon-baoshibaoxiu',
                src: '../image/icons/baoxiufuwu_icon_new.png'
            }, {
                title: '全部服务',
                name: 'phraseusertab_frm',
                require_login: false,
                css: '',
                src: '../image/icons/all_icon_new.png'
            }
            // { title: '积分商城', name: 'jifensc_frm', css: '',src:'../image/icons/jifen_icon.png' },
        ],
        notifylist: [],
        show_banner: true,
        businesslist: [], //优选商家
        productlist: [], //优选商品
        is_rotated: false,
        is_scrolled: false,
        couponform: {
            show_coupon: false,
            CouponID: 0,
            CoverImage: ''
        },
        cache_index: 0,
        tabIndex: 1,
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getapphomesource'
            }, function(succeed, data, err) {
                if (succeed) {
                    //公告列表
                    that.notifylist = data.notifyList;
                    that.newslist = data.newslist;
                    //产品列表
                    that.productlist = data.productlist;
                    that.businesslist = data.businesslist;
                    that.imagelist = data.rotateImages;
                    if (that.imagelist.length == 0) {
                        that.imagelist.push('../image/banner.png');
                    }
                    if (that.notifylist.length > 0) {
                        setTimeout(function() {
                            that.init_srolltext();
                        }, 200)
                    } else {
                        that.is_scrolled = false;
                    }
                    setTimeout(function() {
                        that.set_style();
                    }, 500);
                    setTimeout(function() {
                        that.slider_work();
                    }, 200);
                }
            });
        },
        set_style: function() {
            var that = this;
            if (that.productlist.length == 0) {
                return;
            }
            var el = $api.byId('0_item');
            if (!el) {
                that.set_style();
                return;
            }
            heightArray = [];
            for (var i = 0; i < that.productlist.length; i++) {
                that.set_item_style(i);
            }
        },
        set_item_style: function(index) {
            var that = this;
            var el = $api.byId(index + '_item');
            var itemWidth = $api.offset(el).w;
            var itemHeight = $api.offset(el).h;
            var top = 0;
            var left = 0;
            if (index < 2) {
                // 2- 确定第一行
                top = 0;
                left = itemWidth * index;
                heightArray.push(itemHeight);
            } else {
                var minHeight = heightArray[0];
                var i = 0;
                for (var j = 0; j < heightArray.length; j++) {
                    if (minHeight > heightArray[j]) {
                        minHeight = heightArray[j];
                        i = j;
                    }
                }
                top = heightArray[i];
                left = itemWidth * i;
                heightArray[i] += itemHeight;
            }
            $api.css(el, 'position:absolute;top:' + top + 'px;left:' + left + 'px;');
            if (index == (that.productlist.length - 1)) {
                var maxHeight = 0;
                for (var j = 0; j < heightArray.length; j++) {
                    if (maxHeight < heightArray[j]) {
                        maxHeight = heightArray[j];
                    }
                }
                $api.css($api.byId('content_box'), 'height:' + (maxHeight + 30) + 'px;');
            }
        },
        get_all: function() {
            var that = this;
            that.get_data();
            setTimeout(function() {
                that.get_my_coupon();
            }, 3000);
        },
        image_cache: function() {
            var that = this;
            var item = that.imagelist[that.cache_index];
            api.imageCache({
                url: item.imageurl,
                thumbnail: false
            }, function(ret, err) {
                that.cache_index++;
                if (ret.status) {
                    item.cacheurl = ret.url;
                }
                if (that.cache_index <= that.imagelist.length - 1) {
                    that.image_cache();
                } else {
                    setTimeout(function() {
                        that.slider_work();
                    }, 200)
                }
            });
        },
        get_my_coupon: function() {
            var that = this;
            ns.post({
                action: 'getmyunreadmallcoupon',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.couponform = data;
                    if (data.expiring_list.length > 0) {
                        if (data.expire_coupon_background != '') {
                            setTimeout(function() {
                                var coupon_banner_bg = $api.byId('coupon_banner_bg');
                                $api.css(coupon_banner_bg, 'background-image: url("' + data.expire_coupon_background + '");');
                            }, 10)
                        }
                    }
                    if (data.list.length > 0) {
                        if (data.coupon_background != '') {
                            setTimeout(function() {
                                var coupon_banner_bg = $api.byId('coupon_banner_bg');
                                $api.css(coupon_banner_bg, 'background-image: url("' + data.coupon_background + '");');
                            }, 10)
                        }
                    }
                }
            });
        },
        close_coupon_banner: function() {
            var that = this;
            that.couponform.show_coupon = false;
        },
        do_take_all_coupon: function() {
            var that = this;
            if (that.couponform.list.length > 0) {
                ns.post({
                    action: 'takeallmycoupons',
                    list: JSON.stringify(that.couponform.list)
                }, function(succeed, data, err) {
                    if (succeed) {
                        api.toast({
                            msg: '领取成功',
                            duration: 2000,
                            location: 'bottom'
                        });
                        setTimeout(function() {
                            that.open_coupon(24);
                        }, 2000);
                    } else if (err) {
                        api.toast({
                            msg: err,
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                });
            }
        },
        do_read_all_coupon: function() {
            var that = this;
            if (that.couponform.list.length > 0) {
                ns.post({
                    action: 'readallmycoupons',
                    list: JSON.stringify(that.couponform.list)
                }, function(succeed, data, err) {
                    that.couponform.show_coupon = false;
                });
            }
        },
        //周边商家（子窗体）
        open_nearby_businesslist: function(item) {
            var that = this;
            ns.openWin('dl_nearbyshoplist_frm', '周边商家');
        },

        open_coupon: function(type) {
            var that = this;
            that.couponform.show_coupon = false;
            type = type || 0;
            if (that.couponform.expiring_list.length > 0) {
                type = 24;
            }
            ns.openWin('mycoupon_frm', '优惠券', {
                title: '优惠券',
                url: 'mycoupon_frm.html',
                type: type
            });
        },
        open_rotating: function(item) {
            //alert(item.type);
            var that = this;
            if (item.productid > 0) {
                var name = '';
                var title = '';
                if (item.type == 1) {
                    title = '商品详情';
                    that.open_productDetails(title, item.productid);
                    return;
                }
                if (item.type == 2) {
                    //name = 'business_frm';
                    name = 'dl_shop_frm';
                    title = '商家详情';
                    ns.openWin(name, title, {
                        title: title,
                        url: name + '.html',
                        id: item.productid,
                        searchtype: 2
                    });
                    return;
                }
                if (item.type == 3) {
                    name = 'dl_tongzhidetail_frm';
                    title = '社区公告';
                    ns.openWin(name, title, {
                        title: title,
                        url: name + '.html',
                        id: item.productid
                    }, {
                        needroom: true
                    });
                    return;
                }
                if (item.type == 4) {
                    name = 'dl_tongzhidetail_frm';
                    title = '小区新闻';
                    ns.openWin(name, title, {
                        title: title,
                        url: name + '.html',
                        id: item.productid
                    }, {
                        needroom: true
                    });
                    return;
                }
            }
        },
        open_gonggao_detail: function(id) {
            var that = this;
            ns.openWin('dl_tongzhidetail_frm', '公告详情', {
                id: id
            });
        },
        open_gonggao_list: function(id) {
            var that = this;
            ns.openWin('dl_tongzhigglist_frm', '通知公告', {
                id: 0
            });
        },
        open_win: function(title, name, require_login) {
            var that = this;
            if (name == 'point_mall_frm') {
                ns.openWin(name, title, {
                    title: title,
                    url: name + '.html',
                    searchtype: 3
                }, {
                    needlogin: true
                });
                return;
            }
            if (name == 'pintuan_list_frm') {
                ns.openWin(name, title, {
                    title: title,
                    url: name + '.html',
                    searchtype: 6,
                    type: 22
                });
                return;
            }
            if (name == 'menjinyaoshi') {
                that.do_open_door();
                return;
            }
            if (name == 'wuyejf_frm' || name == 'tousujianyi_frm') {
                ns.openWin(name, title, null, {
                    needroom: true
                });
                return;
            }
            if (name == 'baoxiuservice_frm') {
                ns.openWin(name, title, {
                    title: title,
                    url: name + '.html',
                    type: 11
                }, {
                    needroom: true
                });
                return;
            }
            if (name == 'phraseusertab_frm') {
                api.sendEvent({
                    name: 'do_open_more_service',
                });
                return;
            }
            if (require_login) {
                ns.openWin(name, title, null, {
                    needlogin: true
                });
                return;
            }
            ns.openWin(name, title);
        },
        open_id_win: function(title, name, id, require_login) {
            var options = {};
            if (require_login) {
                options = {
                    needlogin: true
                };
            }
            ns.openWin(name, title, {
                title: title,
                url: name + '.html',
                id: id
            }, options);
        },
        open_business: function(title, name, id, require_login) {
            var options = {};
            if (require_login) {
                options = {
                    needlogin: true
                };
            }
            ns.openWin(name, title, {
                title: title,
                url: name + '.html',
                id: id,
                searchtype: 2
            }, options);
        },
        open_Moreproduct: function(type) {
            var that = this;
            api.sendEvent({
                name: 'mall_onclick',
                extra: {
                    tabIndex: that.tabIndex,
                }
            });
        },
        open_productDetails: function(title, id) {
            var that = this;
            ns.openWin('dl_product_frm', title, {
                id: id,
            });
        },
        open_BusinessDetails: function(title, id) {
            var that = this;
            ns.openWin('dl_shop_frm', title, {
                id: id,
            });
        },
        slider_work: function() {
            var that = this;
            if (that.is_rotated) {
                return;
            }
            that.is_rotated = true;
            slide = new auiSlide({
                container: document.getElementById("aui-slide"),
                "height": 200,
                "speed": 500,
                "autoPlay": 3000, //自动播放
                "loop": true,
                "pageShow": true,
                "pageStyle": 'dot',
                'dotPosition': 'top'
            })
        },
        init_srolltext: function() {
            var that = this;
            if (that.is_scrolled) {
                return;
            }
            that.is_scrolled = true;
            try {
                marqueesHeight = 40; //高度
                stopscroll = false;
                scrollElem = document.getElementById("scrolllayer");
                with(scrollElem) {
                    // style.width = 500; //宽度
                    noWrap = true;
                }
                preTop = 0;
                currentTop = 0;
                stoptime = 0;
                leftElem = document.getElementById("scrollmessage");
                scrollElem.appendChild(leftElem.cloneNode(true));
                var elems = document.getElementsByName('notify_item');
                for (var i = 0; i < elems.length; i++) {
                    elems[i].onclick = function() {
                        var id = $api.attr(this, 'data-id');
                        that.open_gonggao_detail(id);
                    };
                }
            } catch (e) {}
            scrollElem.scrollTop = 0;
            setInterval(function() {
                that.scroll_up();
            }, 15); //滚动速度
        },
        scroll_up: function() {
            if (stopscroll)
                return;
            currentTop += 1;
            if (currentTop == 41) { //滚动距离
                stoptime += 1;
                currentTop -= 1;
                if (stoptime == 200) { //停顿时间
                    currentTop = 0;
                    stoptime = 0;
                }
            } else {
                preTop = scrollElem.scrollTop;
                scrollElem.scrollTop += 1;
                if (preTop == scrollElem.scrollTop) {
                    scrollElem.scrollTop = 0;
                    scrollElem.scrollTop += 1;
                }
            }
        },
        //首页选项卡
        doSelectTab: function(index) {
            this.tabIndex = index;
        },
        doOpenMall: function() {
            api.sendEvent({
                name: 'mall_onclick',
                tabIndex: 0
            });
        },
        doOpenBBs: function() {
            ns.openWin('dl_bbs_frm', '社区论坛', {
                bbs: 1
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_all();
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
};
