var ns, toast, map;
var app = new Vue({
    el: '#app',
    data: {
        domainURL: CONFIG.url,
        //参数
        pageParam: {
            categoryid: 0, //分类ID
            ProductName: '', //产品名称
            condition: '', //条件
            isprimary: false
        },
        list: [],
        is_searching: true,
        form: {
            pageindex: 0,
            pagesize: 10,
        },
        current_item_length: 0
    },
    methods: {
        get_data: function(lon, lat) {
            var that = this;
            that.is_searching = true;
            var options = {};
            options.action = 'getproductlistsbycategoryid';
            options.categoryid = this.pageParam.categoryid;
            options.sortby = this.pageParam.condition;
            options.pageindex = that.form.pageindex;
            options.pagesize = that.form.pagesize;
            options.isbestseller = that.pageParam.isprimary ? 1 : 0;
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    if (that.form.pageindex == 0) {
                        that.list = data.ProductList;
                    } else {
                        that.list = that.list.concat(data.ProductList);
                    }
                    that.current_item_length = that.list.length;
                } else if (err) {
                    that.list = [];
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: false
            });
        },
        open_shop: function(item) {
            var that = this;
            ns.openWin('dl_product_frm', '商品信息', {
                id: item.id,
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
        }
    }
});
apiready = function() {
    api.parseTapmode();
    map = api.require('bMap');
    ns = window.Foresight.Util;
    app.pageParam.categoryid = api.pageParam.categoryid;
    app.pageParam.condition = api.pageParam.sortorder;
    app.pageParam.isprimary = api.pageParam.isprimary;
    toast = new auiToast();
    app.get_data();
    api.addEventListener({
        name: 'reloadproductlist'
    }, function(ret, err) {
        if (ret) {
            if (ret.value.categoryid) {
                app.pageParam.categoryid = ret.value.categoryid;
            }
            if (ret.value.condition) {
                app.pageParam.condition = ret.value.sortOrder;
            }
            if (ret.value.isprimary) {
                app.pageParam.isprimary = ret.value.isprimary;
            } else {
                app.pageParam.isprimary = false;
            }
            app.get_data();
        }
    });
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
