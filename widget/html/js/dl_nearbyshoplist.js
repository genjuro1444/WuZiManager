var ns, toast, map;
var app = new Vue({
    el: '#app',
    data: {
        menus: [],
        list: [],
        categoryid: 0,
        is_searching: false
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            var options = {};
            options.action = 'getnearbyshoplist';
            options.categoryid = that.categoryid;
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    that.list = data.list;
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
        get_menu: function() {
            var that = this;
            var options = {};
            options.action = 'getbusinesscategorylist';
            options.type='businesscategory';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.menus = data.menus;
                    if (that.menus.length > 0) {
                        that.do_select_menu(that.menus[0]);
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
        open_business: function(item) {
            var that = this;
            ns.openWin('dl_nearbyshop_frm', item.title, {
                id: item.id
            });
        },
        do_select_menu: function(item) {
            var that = this;
            for (var i = 0; i < that.menus.length; i++) {
                that.menus[i].is_active = false;
            }
            item.is_active = true;
            that.categoryid = item.id;
            that.get_data();
        },
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.get_menu();
};
