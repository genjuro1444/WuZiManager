var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        businessinfo: {
            id: 0,
            title: '',
            rate: '',
            address: '',
            distance: '',
            imageurl: '../image/error-img.png',
            is_ziying: true
        },
        productlist: [],
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            var options = {};
            options.action = 'getbusinessnearbyinfobyid';
            options.ID = that.businessinfo.id;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.productlist = data.productlist;
                    that.businessinfo = data.businessinfo;
                } else if (err) {
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
        do_call: function() {
            var that = this;
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
