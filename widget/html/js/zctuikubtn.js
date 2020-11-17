var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            cantuiku: true,
        }
    },
    methods: {
        do_remove: function() {
            var that = this;
            api.sendEvent({
                name: 'do_start_remove_tuiku',
                extra: {
                    id: that.form.id
                }
            });
        },
        do_close: function() {
            var that = this;
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
}
