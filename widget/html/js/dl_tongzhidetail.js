var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            title: '',
            tag: '',
            time: '',
            content: '',
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.id = that.form.id;
            options.action = 'getwuyegonggaodetail';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form = data;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, { toast: true });
        },
        save_read: function() {
            var that = this;
            var options = {};
            options.type = 1;
            options.deviceid = api.deviceId;
            options.id = that.form.id;
            options.action = 'saveusermsg';
            ns.post(options, function(succeed, data, err) {
                api.sendEvent({
                    name: 'savereadingpagecomplete'
                });
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.form.id = api.pageParam.id || 0;
    app.get_data();
    app.save_read();
}
