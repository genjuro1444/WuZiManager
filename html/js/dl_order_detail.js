var ns;
var app = new Vue({
    el: '#app',
    data: {
        orderid: 0,
        orderidlist: [],
        paytype: 0,
        orderlist: [],
        ordersummary: {
            totalprice: 0,
            totalpricedesc: ''
        },
        // productlist: [],
        // productsummary: {
        //     totaldesc: '',
        //     totalprice: 0,
        // },
        // orderinfo: {},
        // myaddress: {
        //     id: 0,
        //     username: '',
        //     phonenumber: '',
        //     addressdetail: '',
        // },
        //businessinfo: {},
        // show_address: false,
        // show_shiprate: false
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getorderlistinfo',
                orderid: that.orderid,
                orderidlist: JSON.stringify(that.orderidlist),
                paytype: that.paytype
            }, function(succeed, data, err) {
                if (succeed) {
                    that.orderlist = data.list;
                    that.ordersummary = data.ordersummary;
                } else {
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
            if (item.ProductTypeID == 10) {
                return;
            }
            if (item.ProductTypeID == 5) {
                ns.openWin('servicedetail_frm', item.title, {
                    title: item.title,
                    url: 'servicedetail_frm.html',
                    id: item.productid
                }, {
                    needlogin: true
                });
                return;
            }
            var type = item.ProductOrderType || 16;
            ns.openWin('dl_product_frm', item.title, {
                id: item.productid,
                type: type
            });
        },
        open_business: function(id) {
            var that = this;
            ns.openWin('dl_shop_frm', '商家详情', {
                id: id,
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.orderid = api.pageParam.id;
    var orderids = api.pageParam.ids || '[]';
    app.orderidlist = eval('(' + orderids + ')');
    app.paytype = api.pageParam.type;
    app.get_data();
    setTimeout(function() {
        api.sendEvent({
            name: 'on_open_ordercomplete'
        });
    }, 100);
};
