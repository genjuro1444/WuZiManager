var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            canshenqing: false,
            canruku: false,
            canlingyong: false,
            canfenpei: false,
            cantuiku: false,
            canborrow: false,
            canborrowback: false,
            canchange: false
        }
    },
    methods: {
        get_data: function () {
            var that = this;
            if (ns.AllowAuth('ZCGLSHENQING')) {
                that.form.canshenqing = true;
            }
            if (ns.AllowAuth('ZCGLADD')) {
                that.form.canruku = true;
            }
            if (ns.AllowAuth('ZCGLORDER')) {
                that.form.canlingyong = true;
                that.form.canfenpei = true;
                that.form.cantuiku = true;
                that.form.canborrow = true;
                that.form.canborrowback = true;
                that.form.canchange = true;
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
        do_ruku: function () {
            var that = this;
            api.sendEvent({
                name: 'do_open_add',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_more_ruku: function () {
            var that = this;
            api.sendEvent({
                name: 'do_open_add',
                extra: {
                    id: that.form.id,
                    addmore: true
                }
            });
            that.do_close();
        },
        do_lingyong: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_lingyong',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_fenpei: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_fenpei',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_tuiku: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_tuiku',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_borrow: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_borrow',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_guihuan: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_borrowback',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_biangeng: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_change',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_borrowback: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_borrowback',
                extra: {
                    id: that.form.id
                }
            });
            that.do_close();
        },
        do_changelingyong: function () {
            var that = this;
            api.sendEvent({
                name: 'do_start_changelingyong',
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
