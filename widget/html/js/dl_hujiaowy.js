var ns;
var app = new Vue({
    el: '#app',
    data: {
        current_id: 0,
        hujiao_info: []
    },
    methods: {
        tel_phone: function(item) {
            ns.confirmPer('phone', function() {
                api.call({
                    type: 'tel_prompt',
                    number: item.phonenumber
                });
            })
        },
        get_data: function() {
            var that = this;
            var options = {};
            options.action = 'getmycallphonelist';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.hujiao_info = data.list;
                } else if (err) {
                    that.hujiao_info = [];
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
      
        open_menu: function(item) {
            var that = this;
            that.mysubmenulist = [];
            for (var i = 0; i < that.menus.length; i++) {
                that.menus[i].is_active = false;
            }
            for (var i = 0; i < that.sub_menus.length; i++) {
                if (item.id == that.sub_menus[i].parentId) {
                    that.mysubmenulist.push(that.sub_menus[i]);
                }
            }
            item.is_active = true;
            that.current_id = item.id;
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
};
