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
            repassword: ''
        },
        imageurl: ''
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getrotatingimages',
                type: 3,
            }, function(succeed, data, err) {
                if (succeed) {
                    if (data.imagelist.length > 0) {
                        that.imageurl = data.imagelist[0].imageurl;
                    }
                }
            });
        },
        do_send: function() {
            var that = this;
            // alert(that.form.phonenumber);
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
            ns.post({ action: 'retrievelpwdcheckphone', Username: that.form.phonenumber }, function(succeed, data, err) {
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
                action: 'completeretrievepwd',
                Username: that.form.phonenumber,
                verifycode: that.form.verifycode,
                password: that.form.password,
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
    app.get_data();
};
