var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            password: '',
            newpassword: '',
            confirmpassword: ''
        }
    },
    methods: {
        do_save: function() {
            var that = this;
            if (that.form.password == '') {
                api.toast({
                    msg: '请输入原密码',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.newpassword == '') {
                api.toast({
                    msg: '请输入新密码',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.newpassword != that.form.confirmpassword) {
                api.toast({
                    msg: '两次输入的密码不一致',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            var delay = 0;
            if (api.systemType != 'ios') {
                delay = 300;
            }
            ns.post({
                action: 'savenewpassword',
                password: that.form.password,
                newpassword: that.form.newpassword,
            }, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '修改成功',
                        duration: 2000,
                        location: 'bottom'
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
};