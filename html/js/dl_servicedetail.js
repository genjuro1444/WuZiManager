var ns, dialog;
ns = window.Foresight.Util;
var app = new Vue({
    el: '#app',
    data: {
        imglist: [],
        form: {
            ID: 0,
            Title: '',
            ContactPhone: '',
            ServiceIncude: '',
            ServiceStandard: '',
            AppointNotify: '',
            TypeName: '',
            imageurl: '',
            pricedesc: '',
            inventorydesc: '',
            chosenvariatname: '',
            quantity: 1
        },
        typelist: [],
        loading_success: true,
        errormsg: '',
        show_buynow: false
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({ action: 'gethouseservicedetail', ID: that.form.ID }, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.data_item;
                    that.imglist = data.imglist;
                    that.typelist = data.typelist;
                    setTimeout(function() {
                        that.slide_reset();
                    }, 500);
                } else if (err) {
                    that.loading_success = false;
                    that.errormsg = err;
                }
            });
        },
        slide_reset: function() {
            var slide = new auiSlide({
                container: document.getElementById("aui-slide"),
                "height": 200,
                "speed": 500,
                "autoPlay": 3000, //自动播放
                "loop": true,
                "pageStyle": 'dot',
                "pageShow": true,
                'dotPosition': 'top'
            })
        },
        do_call: function(item) {
            window.location.href = "tel:" + this.form.ContactPhone;
        },
        do_place_order() {
            var that = this;
            ns.openWin('orderconfirm_frm', '订单确认', {
                title: '订单确认',
                url: 'orderconfirm_frm.html',
                id: that.form.ID,
                variantid: that.form.typeid,
                quantity: that.form.quantity,
                type: 14,
            }, { needroom: true });
        },
        hide_buybox: function() {
            var that = this;
            that.show_buynow = false;
        },
        reduce_count: function() {
            var that = this;
            if (that.form.quantity <= 1) {
                return;
            }
            that.form.quantity--;
        },
        add_count: function() {
            var that = this;
            that.form.quantity++;
        },
        do_buynow: function() {
            var that = this;
            if (that.typelist.length == 0) {
                that.do_place_order();
            }
            that.show_buynow = true;
        },
        do_quantity_change: function() {
            var that = this;
            if (that.form.quantity < 1) {
                that.form.quantity = 1;
                return;
            }
        },
        do_variant_select: function(item) {
            var that = this;
            for (var i = 0; i < that.typelist.length; i++) {
                var current = that.typelist[i];
                current.selected = false;
                if (current.id == item.id) {
                    that.form.pricedesc = '￥' + item.UnitPrice.toFixed(2);
                    that.form.typeid = item.ID;
                    that.form.chosenvariatname = '已选: ' + item.TypeName;
                }
            }
            item.selected = true;
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.ID = api.pageParam.id;
    app.get_data();
}
