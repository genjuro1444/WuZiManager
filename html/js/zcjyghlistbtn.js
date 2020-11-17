var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            canborrow: false,
            canborrowback: false,
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            if (ns.AllowAuth('ZCGLORDER')) {
                that.form.canborrow = true;
                that.form.canborrowback = true;
            }
        },
        do_borrow: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_borrow',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_guihuan: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_borrowback',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_close: function() {
            setTimeout(function() {
                api.closeFrame();
            }, 200);
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.id = ns.getPageParam('id') || 0;
    app.get_data();
}
