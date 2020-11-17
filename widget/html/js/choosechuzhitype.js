var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        list: [{
            id: 10,
            name: '丢失',
            checked: false
        }, {
            id: 20,
            name: '转让',
            checked: false
        }, {
            id: 90,
            name: '报废',
            checked: false
        }, {
            id: 100,
            name: '其他',
            checked: false
        }, ],
    },
    methods: {
        get_data: function() {
            var that = this;
        },
        do_cancel: function() {
            var that = this;
            that.do_choose(0, {
                id: 0,
                name: ''
            });
        },
        do_choose: function(item) {
            var that = this;
            item.checked = true;
            api.sendEvent({
                name: 'do_choose_chuzhitype_complete',
                extra: {
                    id: item.id,
                    name: item.name
                }
            });
            setTimeout(function() {
                api.closeWin({});
            }, 100)
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
}
