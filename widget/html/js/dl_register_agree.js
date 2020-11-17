var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            content: ''
        },
        imageurl: '',
        isUserAgreement: false,
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getuserregistercontent',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form.content = data.content;
                }
            });
        },
        do_agree: function() {
            var that = this;
            api.closeWin();
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
};
