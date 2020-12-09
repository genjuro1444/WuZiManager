var ns, toast, actionsheet, UIActionProgress;
var app = new Vue({
    el: '#app',
    data: {
        userinfo: {
            username: '管理员',
            phonenumber: ''
        },
        file: {
            headimg: '../image/default_user.png',
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            var uid = ns.getPrefs('uid');
            var options = {
                action: 'APP_GETMYSELFMODEL',
                P1: uid
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.userinfo = data.data;
                    if (data.headimg) {
                        that.file.headimg = data.headimg;
                    } else {
                        that.file.headimg = '../image/default_user.png';
                    }
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        changepwd: function() {
            var that = this;
            var name = 'changepwd_frm';
            var title = '修改密码';
            ns.openWin(name, title);
        },
        do_edit_self: function() {
            var that = this;
            var name = 'myself_frm';
            var title = '个人中心';
            ns.openWin(name, title);
        },
        checkupdate: function() {
            appupgrade.check_upgrade(true);
        },
        do_logout: function() {
            ns.removePrefs([], true);
            api.sendEvent({
                name: 'onlogin'
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    UIActionProgress = api.require('UIActionProgress');
    toast = new auiToast();
    actionsheet = new auiActionsheet();
    app.get_data();
    api.addEventListener({
        name: 'do_reload_homeself'
    }, function() {
        app.get_data();
    });
    api.addEventListener({
        name: 'onlogin'
    }, function() {
        app.get_data();
    });
}
