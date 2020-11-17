var ns;
var app = new Vue({
    el: '#app',
    data: {
        domainURL: CONFIG.url,
        xiaoqulist: [],
        tabIndex: -1,
        subTabIndex: -1,
        current_title: '商城',
        current_id: 0,
        //商品分类
        servicelist: [{
            id: 0,
            title: '推荐商品',
            src: '',
            selected: 'false',
            parentid: 0
        }],
        //商品二级分类
        menus: [],
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.action = 'getmallcategorylist';
            options.type = 'productcategory';
            options.parentid = 0;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.servicelist = data.servicelist;
                    if (data.servicelist.length > 0) {
                        var chlidrenparentid = data.servicelist[0].id;
                        var chlidrenoptions = {};
                        chlidrenoptions.action = 'getmallcategorylist';
                        chlidrenoptions.type = 'productcategory';
                        chlidrenoptions.parentid = chlidrenparentid;
                        ns.post(chlidrenoptions, function(succeed, data, err) {
                            if (succeed) {
                                that.menus = data.servicelist;
                            } else if (err) {
                                api.toast({
                                    msg: err,
                                    duration: 2000,
                                    location: 'bottom'
                                });
                            }
                            that.reloadProductItems(0, true);
                        });
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
        //分类Id切换
        doSelectTab: function(index, id) {
            var that = this;
            var chlidrenparentid = id;
            var chlidrenoptions = {};
            chlidrenoptions.action = 'getmallcategorylist';
            chlidrenoptions.type = 'productcategory';
            chlidrenoptions.parentid = chlidrenparentid;
            ns.post(chlidrenoptions, function(succeed, data, err) {
                if (succeed) {
                    that.menus = data.servicelist;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
            this.tabIndex = index;
            this.subTabIndex = -1;
        },
        doSelectSubMenu: function(index, id) {
            this.subTabIndex = index;
            this.reloadProductItems(id, false);
        },
        openProductItems: function(id, isprimary) {
            var header_h = api.pageParam.header_h;
            var footer_h = api.pageParam.footer_h;
            var width = $api.offset($api.byId('left_content_box')).w;
            api.openFrame({
                name: 'dl_productitems',
                url: './dl_productitems.html',
                rect: {
                    x: width,
                    y: header_h,
                    w: 'auto',
                    h: 'auto',
                    marginBottom: footer_h
                },
                pageParam: {
                    categoryid: id,
                    isprimary: isprimary
                }
            });
        },
        reloadProductItems: function(id, isprimary) {
            var that = this;
            var frames = api.frames();
            var isProductFrameOpen = false;
            for (var i = 0; i < frames.length; i++) {
                if (frames[i].name == 'dl_productitems') {
                    isProductFrameOpen = true;
                    break;
                }
            }
            that.openProductItems(id, isprimary);
            if (isProductFrameOpen) {
                api.sendEvent({
                    name: 'reloadproductlist',
                    extra: {
                        categoryid: id,
                        isprimary: isprimary
                    }
                });
            }
        },
        doSelectMainProduct: function() {
            var that = this;
            that.tabIndex = -1;
            that.subTabIndex = -1;
            this.reloadProductItems(0, true);
        },
        doSelectMainShop: function() {
            this.tabIndex = -2;
            this.subTabIndex = -1;
            var header_h = api.pageParam.header_h;
            var footer_h = api.pageParam.footer_h;
            var width = $api.offset($api.byId('left_content_box')).w;
            api.openFrame({
                name: 'dl_shoplist_frm',
                url: './dl_shoplist_frm.html',
                rect: {
                    x: width,
                    y: header_h,
                    w: 'auto',
                    h: 'auto',
                    marginBottom: footer_h
                }
            });
        },
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
    if (api.pageParam.lefttype == 1) {
        app.doSelectMainProduct();
    }
    if (api.pageParam.lefttype == 2) {
        app.doSelectMainShop();
    }
    api.addEventListener({
        name: 'do_change_mall_shop_tab'
    }, function(ret, err) {
        if (ret) {
            if (ret.value.tabIndex == 1) {
                app.doSelectMainProduct();
            }
            if (ret.value.tabIndex == 2) {
                app.doSelectMainShop();
            }
        }
    });
};
