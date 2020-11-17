var ns;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        is_searching: true
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            var options = {};
            options.action = 'getmallchattitlelist';
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
            });
        },
        open_message_chatdetail: function(id) {
            var that = this;
            ns.openWin('dl_message_chatdetail_frm', '在线聊天', {
                id: id,
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
};
