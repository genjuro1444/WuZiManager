var ns, ajpush, count = 0,
    toast;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            UserName: '',
            password: '',
            action: 'APP_LOGIN',
            device_id: '',
            device_type: '',
            islogin: 1
        }
    },
    methods: {
        do_login: function() {
            var that = this;
            if (!that.form.UserName) {
                toast.hide();
                api.toast({
                    msg: '请输入用户名',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (!that.form.password) {
                toast.hide();
                api.toast({
                    msg: '请输入密码',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            // if (that.form.device_id == '' && count <= 1) {
            //     that.get_jiguang_register_id();
            //     setTimeout(function() {
            //         that.do_login();
            //     }, 1000);
            //     count++;
            //     return;
            // }
            // if (that.form.device_id == '') {
            //     api.toast({
            //         msg: '极光id获取失败',
            //         duration: 1000,
            //         location: 'bottom'
            //     });
            // }
            ns.post(that.form, function(succeed, data, err) {
                if (succeed) {
                    ns.setPrefs({
                        uid: data.uid,
                        UserRealName: data.UserRealName,
                        BranchCode: data.BranchCode,
                        DeptName: data.DeptName,
                    });
                    api.sendEvent({
                        name: 'onlogin'
                    });
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: true,
                toastmsg: '登录中'
            });
        },
        get_jiguang_register_id: function() {
            var that = this;
            ajpush.getRegistrationId(function(res, err) {
                if (res && res.id) {
                    that.form.device_id = res.id;
                    ns.setPrefs({
                        'cid': that.form.device_id || ''
                    });
                }
            });
        },
        do_retrivepwd: function() {
            var that = this;
            ns.openWin('retrievepwd_frm', '密码找回');
        }
    }
});

apiready = function() {
    ns = window.Foresight.Util;
    ajpush = api.require('ajpush');
    toast = new auiToast();
    app.get_jiguang_register_id();
    app.form.device_type = api.systemType;
}
