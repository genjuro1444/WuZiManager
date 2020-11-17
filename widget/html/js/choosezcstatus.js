var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        list: [{
            id: 10,
            name: '闲置',
            checked: false
        }, {
            id: 20,
            name: '使用中',
            checked: false
        }, {
            id: 30,
            name: '借用',
            checked: false
        }, {
            id: 100,
            name: '待处置',
            checked: false
        }, {
            id: 200,
            name: '已处置',
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
                name: 'do_choose_zcstatus_complete',
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
