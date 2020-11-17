var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            qrcodeurl: ''
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getxiaoquqrcode',
                ID: that.form.id
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form.qrcodeurl = data.qrcodeurl;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.id = api.pageParam.id || 0;
    app.get_data();
}