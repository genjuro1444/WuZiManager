var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            status: 0,
            canedit: true,
            canlingyong: false,
            canfenpei: false,
            cantuiku: false,
            canborrow: false,
            canborrowback: false,
            candelete: false
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            if (that.form.status == 10) { //空闲
                that.form.canlingyong = true;
                that.form.canfenpei = true;
                that.form.canborrow = true;
                that.form.candelete = true;
            }
            if (that.form.status == 15) { //已领用
                that.form.canfenpei = true;
                that.form.cantuiku = true;
            }
            if (that.form.status == 20) { //使用中
                that.form.cantuiku = true;
            }
            if (that.form.status == 30) { //借出中
                that.form.canborrowback = true;
            }
        },
        do_edit: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_edit_zc',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_lingyong: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_lingyong_add',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_fenpei: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_fenpei_add',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_tuiku: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_tuiku_add',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_borrow: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_borrow_add',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_borrowback: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_borrowback_add',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_remove: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_remove_zc',
                extra: {
                    id: that.form.id
                }
            });
            // that.do_close();
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
