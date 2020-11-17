var ns;
var app = new Vue({
    el: '#app',
    data: {
        list: []
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getmyrooms',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.list = data.list;
                } else {
                    that.list = [];
                }
            });
        },
        do_remove: function(id) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确认解除绑定?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    ns.post({
                        action: 'removemyroom',
                        ProjectID: id
                    }, function(succeed, data, err) {
                        if (succeed) {
                            that.get_data();
                            api.toast({
                                msg: '解绑成功',
                                duration: 2000,
                                location: 'bottom'
                            });
                        } else {
                            api.toast({
                                msg: err,
                                duration: 2000,
                                location: 'bottom'
                            });
                        }
                    });
                }
            });
        },
        do_viewqrcode: function(id) {
            var that = this;
            var title = '查看二维码';
            ns.openWin('dl_myxiaoqu_qrcode_frm', title, {
                id: id
            }, {
                needlogin: true
            });
        },
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
        },
        open_addfamily: function() {}
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
    api.addEventListener({
        name: 'binduserroomsuccess'
    }, function() {
        app.get_data();
    });
}
