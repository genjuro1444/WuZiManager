var ns;
var app = new Vue({
    el: '#app',
    data: {},
    methods: {
        do_scan: function() {
            var that = this;
            var FNScanner = api.require('FNScanner');
            FNScanner.openScanner({
                autorotation: true
            }, function(ret, err) {
                if (ret) {
                    if (ret.eventType == 'success') {
                        that.do_bind(ret.content);
                    }
                }
            });
        },
        do_bind: function(ID) {
            var that = this;
            ns.post({
                action: 'binduserroom',
                ID: ID
            }, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '绑定成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    api.sendEvent({
                        name: 'binduserroomsuccess'
                    });
                    setTimeout(function() {
                        api.closeWin();
                    }, 1000);
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    api.sendEvent({
        name: 'close_popup'
    })
}