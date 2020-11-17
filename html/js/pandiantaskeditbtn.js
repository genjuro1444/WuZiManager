var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            status: -1,
            canedit: false,
            cancomplete: false,
            cancancelcomplete: false,
            canpd: false,
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            if (that.form.status == 10) {
                that.form.canedit = true;
                that.form.cancomplete = true;
                that.form.canpd = true;
            } else {
                that.form.cancancelcomplete = true;
            }
        },
        do_edit: function() {
            var that = this;
            api.sendEvent({
                name: 'do_open_pd_edit',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_complete: function(status) {
            var that = this;
            api.sendEvent({
                name: 'do_open_pd_complete',
                extra: {
                    id: that.form.id,
                    status: status
                }
            });
            // that.do_close();
        },
        do_pandian: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_pandian',
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
    app.form.status = ns.getPageParam('status') || 0;
    app.get_data();
}
