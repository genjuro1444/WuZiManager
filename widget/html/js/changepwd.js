var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            OldPwd: '',
            Password: '',
            RePassword: '',
            action: 'savepassword'
        }
    },
    methods: {
        dosave: function() {
            var that = this;
            if (that.form.OldPwd == '') {
                api.toast({
                    msg: '请输入原密码',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.Password == '') {
                api.toast({
                    msg: '请输入新密码',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.RePassword == '') {
                api.toast({
                    msg: '请确认新密码',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.RePassword != that.form.Password) {
                api.toast({
                    msg: '两次密码输入不一致',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            var options = {
                action: 'XTGL_MODIFYPWD',
                P1: that.form.Password,
                P2: that.form.RePassword,
                oldPwd: that.form.OldPwd
            }
            ns.post(options, function(succeed, data, err) {
                toast.hide();
                if (succeed) {
                    api.toast({
                        msg: '修改成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    setTimeout(function() {
                        api.closeWin();
                    }, 500);
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 20000,
                        location: 'bottom'
                    });
                }
            }, { toast: true, toastmsg: '提交中' });
        }
    }
});

apiready = function() {
    ns = window.Foresight.Util;
    toast = new auiToast();
}