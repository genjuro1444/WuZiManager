var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            canlingyong: false,
            cantuiku: false,
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            if (ns.AllowAuth('ZCGLORDER')) {
                that.form.canlingyong = true;
                that.form.cantuiku = true;
            }
        },
        do_lingyong: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_lingyong',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_tuiku: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_tuiku',
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
