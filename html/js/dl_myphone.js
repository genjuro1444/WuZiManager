var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            currentphoneno: '',
            phonenumber: '',
            codeissent: false,
            codesentcomplete: false,
            countdown: '',
            verifycode: ''
        }
    },
    methods: {
        get_userinfo: function() {
            var that = this;
            ns.post({
                action: 'getuserinfo'
            }, function(succeed, data, err) {
                if (succeed) {
                    if (data.phoneno) {
                        that.form.currentphoneno = data.phoneno
                    }
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_send: function() {
            var that = this;
            if (that.form.phonenumber == '') {
                api.toast({
                    msg: '请输入手机号',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (!ns.check_mobile(that.form.phonenumber)) {
                api.toast({
                    msg: '请输入正确的手机号',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            var delay = 0;
            if (api.systemType != 'ios') {
                delay = 300;
            }
            ns.post({ action: 'changephonecheck', Username: that.form.phonenumber }, function(succeed, data, err) {
                if (succeed) {
                    that.form.codeissent = true;
                    that.form.codesentcomplete = true;
                    var second = 60;
                    that.form.countdown = second + '秒';
                    var countdown = setInterval(function() {
                        second--;
                        that.form.countdown = second + '秒';
                        if (second < 1) {
                            that.form.codeissent = false;
                            clearInterval(countdown);
                        }
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
        do_save: function() {
            var that = this;
            if (that.form.phonenumber == '') {
                api.toast({
                    msg: '请输入手机号',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (!ns.check_mobile(that.form.phonenumber)) {
                api.toast({
                    msg: '请输入正确的手机号',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.verifycode == '') {
                api.toast({
                    msg: '请输入验证码',
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
                action: 'savenewphoneno',
                Username: that.form.phonenumber,
                verifycode: that.form.verifycode
            }, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '修改成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    api.sendEvent({
                        name: 'changeuserinfosuccess'
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
    app.get_userinfo();
};