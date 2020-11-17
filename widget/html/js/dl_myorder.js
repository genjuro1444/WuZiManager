var ns;
var app = new Vue({
    el: '#app',
    data: {},
    methods: {
        open_myorder_detail: function(item) {
            var that = this;
            ns.openWin('dl_myorder_detail_frm', '账单详情', {
                id: 0,
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    // app.get_data();
};
