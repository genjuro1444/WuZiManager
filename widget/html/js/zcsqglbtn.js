var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            canshenqing: true,
        }
    },
    methods: {
        get_data: function () {
            var that = this;
            if (ns.AllowAuth('ZCGLSHENQING')) {
                that.form.canshenqing = true;
            }
        },
        do_shenqing: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_shenqing',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_close: function () {
            setTimeout(function () {
                api.closeFrame();
            }, 200);
        }
    }
});
apiready = function () {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.id = ns.getPageParam('id') || 0;
    app.get_data();
}
