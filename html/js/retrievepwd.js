var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            phonenumber: '',
            codeissent: false,
            codesentcomplete: false,
            countdown: '',
            verifycode: '',
            password: '',
            repassword: '',
            sentcode: '',
            expiremin: 15,
            codeverifysuccess: false
        },
    },
    methods: {
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
            ns.post({
                action: 'APP_SENDVERIFYCODE',
                phone: that.form.phonenumber,
                islogin: 1
            }, function(succeed, data, err) {
                if (succeed) {
                    var codeexpiretime = new Date().valueOf() + (1000 * 60 * that.form.expiremin);
                    ns.setPrefs({
                        verifycode: that.form.phonenumber + '-' + codeexpiretime + '-' + data
                    });
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
            }, {
                toast: true,
                toastmsg: '发送中'
            });
        },
        get_sentcode: function() {
            var that = this;
            that.form.sentcode = '';
            var verifycode = ns.getPrefs('verifycode');
            if (!verifycode) {
                return;
            }
            var phone = '';
            var timevalue = 0;
            var code = '';
            var codeArray = verifycode.split('-');
            for (var i = 0; i < codeArray.length; i++) {
                if (i == 0) {
                    phone = codeArray[i];
                }
                if (i == 1) {
                    timevalue = codeArray[i];
                }
                if (i == 2) {
                    code = codeArray[i];
                }
            }
            if (phone != that.form.phonenumber) {
                return;
            }
            if (new Date().valueOf() > Number(timevalue)) {
                ns.removePrefs(['verifycode'])
                return;
            }
            that.form.sentcode = code;
        },
        do_check: function() {
            var that = this;
            if (that.form.phonenumber == '') {
                api.toast({
                    msg: '请输入手机号',
                    duration: 2000,
                    location: 'bottom'
                });
                return false;
            }
            if (!ns.check_mobile(that.form.phonenumber)) {
                api.toast({
                    msg: '请输入正确的手机号',
                    duration: 2000,
                    location: 'bottom'
                });
                return false;
            }
            if (that.form.verifycode == '') {
                api.toast({
                    msg: '请输入验证码',
                    duration: 2000,
                    location: 'bottom'
                });
                return false;
            }
            that.get_sentcode();
            if (that.form.verifycode != that.form.sentcode) {
                api.toast({
                    msg: '验证码不正确',
                    duration: 2000,
                    location: 'bottom'
                });
                return false;
            }
            that.form.codeverifysuccess = true;
            ns.removePrefs(['verifycode'])
            return true;
        },
        do_save: function() {
            var that = this;
            if (!that.do_check()) {
                return;
            }
            if (that.form.password == '') {
                api.toast({
                    msg: '请输入密码',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.password != that.form.repassword) {
                api.toast({
                    msg: '两次密码不一致',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            ns.post({
                action: 'APP_CHANGEPWD',
                phone: that.form.phonenumber,
                verifycode: that.form.verifycode,
                password: that.form.password,
                islogin: 1
            }, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '密码找回成功,返回登录',
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
