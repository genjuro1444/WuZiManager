var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            status: 0,
            canremove: false,
            cancomplete: false,
            canedit: false,
            cancancel: false,
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            if (that.form.status == 10) { //维修中
                that.form.canremove = true;
                that.form.cancomplete = true;
                that.form.canedit = true;
            }
            else {
                that.form.cancancel = true;
            }
        },
        do_edit: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_edit_weixiu',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_remove: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_remove_weixiu',
                extra: {
                    id: that.form.id,
                    status: 1
                }
            });
        },
        do_complete: function(_status) {
            var that = this;
            api.sendEvent({
                name: 'do_start_complete_weixiu',
                extra: {
                    id: that.form.id,
                    status: _status
                }
            });
            //that.do_close();
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
