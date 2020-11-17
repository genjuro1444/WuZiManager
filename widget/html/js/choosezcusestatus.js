var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        list: [{
            id: 10,
            name: '维修中',
            checked: false
        }, {
            id: 0,
            name: '正常',
            checked: false
        }, ],
    },
    methods: {
        do_cancel: function() {
            var that = this;
            that.do_choose({
                id: 0,
                name: ''
            });
        },
        do_choose: function(item) {
            var that = this;
            item.checked = true;
            api.sendEvent({
                name: 'do_choose_zcusestatus_complete',
                extra: {
                    name: item.name,
                    id: item.id
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
}
