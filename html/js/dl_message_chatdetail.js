var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            productid: 0,
            Content: ''
        },
        list: [],
        getdata_timeout: null
    },
    methods: {
        get_data: function(can_scroll) {
            var that = this;
            ns.post({ action: 'getmallchatdetaillist', id: that.form.id, productid: that.form.productid }, function(succeed, data, err) {
                if (succeed) {
                    that.form.id = data.id;
                    that.list = data.list;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
                if (can_scroll) {
                    setTimeout(function() {
                        app.do_scroll();
                    }, 200);
                }
                that.getdata_timeout = setTimeout(function() {
                    that.get_data(false);
                }, 5000);
            })
        },
        do_scroll: function() {
            var h = document.documentElement.scrollHeight || document.body.scrollHeight;
            document.body.scrollTop = h;
        },
        start_post: function() {
            var that = this;
            setTimeout(function() {
                that.resize_textarea();
            }, 200);
        },
        resize_textarea: function() {
            var text = document.getElementById("textarea");
            autoTextarea(text, 0, 100);
        },
        do_post: function() {
            var that = this;
            if (that.form.Content == '') {
                return;
            }
            ns.post({
                action: 'postmallchatcontent',
                content: that.form.Content,
                id: that.form.id,
            }, function(succeed, data, err) {
                if (that.getdata_timeout != null) {
                    clearTimeout(that.getdata_timeout);
                }
                that.get_data(true);
                if (succeed) {
                    that.form.Content = '';
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, { toast: true, toastmsg: '发送中' });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.id = api.pageParam.id || 0;
    app.form.productid = api.pageParam.productid || 0;
    toast = new auiToast();
    app.get_data(true);
    app.resize_textarea();
}
