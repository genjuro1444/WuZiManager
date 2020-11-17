var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            QrcodePath: '',
            MemberNumber: ''
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getmyusermemberinfo'
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form = data;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                    setTimeout(function() {
                        api.closeWin();
                    }, 1000)
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
};
