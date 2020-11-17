var ns, toast, map;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        categoryid: 0,
        is_searching: false
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            var options = {};
            options.action = 'getshoplist';
            options.isbestseller = 1;
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    that.list = data.businesslist;
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
        open_business: function(item) {
            var that = this;
            ns.openWin('dl_shop_frm', item.title, {
                id: item.id
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.get_data();
};
