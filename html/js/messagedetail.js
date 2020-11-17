var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            ID: 0
        },
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.P1 = that.form.ID;
            options.action = 'APP_GETMESSAGEMODEL';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form = data;
                    that.read_data();
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
        read_data: function() {
            var that = this;
            var options = {};
            options.P1 = that.form.ID;
            options.action = 'APP_READMESSAGE';
            ns.post(options, function(succeed, data, err) {
                api.sendEvent({
                    name: 'getmessagecount',
                });
                api.sendEvent({
                    name: 'do_reload_messagelist',
                });
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.ID = api.pageParam.id || 0;
    app.get_data();
}
