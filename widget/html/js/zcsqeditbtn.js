var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            status: 0,
            canedit: false,
            cancancel: false,
            canruku: false,
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            if (that.form.status == 10) { //空闲
                that.form.canedit = true;
                that.form.cancancel = true;
            }
            if (that.form.status == 10||that.form.status == 15) { //空闲
                that.form.canruku = true;
            }
        },
        do_edit: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_edit_zcsq',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_cancel: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_cancel_zcsq',
                extra: {
                    id: that.form.id
                }
            });
        },
        do_ruku: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_ruku_zcsq',
                extra: {
                    id: that.form.id
                }
            });
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
