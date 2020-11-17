var ns, ajpush, count = 0,
    wx, qq, weibo;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            username: '',
            password: '',
            device_type: '',
            device_id: '',
            openid: '',
            logintype: 1, //1-手机号登录 8-微信登录 9-qq登录
            showweixin: false,
            showqq: false,
            showweibo: false
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
        get_thridlogin_auth: function() {
            var that = this;
            ns.post({
                action: 'checkthridenablestatus',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form.showweixin = data.showweixin;
                    that.form.showqq = data.showqq;
                    that.form.showweibo = data.showweibo;
                }
                if (!that.form.showweixin) {
                    wx.isInstalled(function(ret, err) {
                        if (ret.installed) {
                            that.form.showweixin = true;
                        } else {
                            that.form.showweixin = false;
                        }
                    });
                }
                if (!that.form.showqq) {
                    qq.installed(function(ret, err) {
                        if (ret.status) {
                            that.form.showqq = true;
                        } else {
                            that.form.showqq = false;
                        }
                    });
                }
                if (!that.form.showweibo) {
                    weibo.isInstalled(
                        function(ret) {
                            if (ret.status) {
                                that.form.showweibo = true;
                            } else {
                                that.form.showweibo = false;
                            }
                        }
                    );
                }
            });
        },
        do_register: function() {
            var that = this;
            ns.openWin('dl_register_frm', '注册');

        },
        do_login: function() {
            var that = this;
            if (that.form.logintype == 1) {
                if (that.form.username == '') {
                    api.toast({
                        msg: '请输入手机号码',
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
            }
            if (that.form.device_id == '' && count <= 1) {
                that.get_jiguang_register_id();
                setTimeout(function() {
                    that.do_login();
                }, 1000);
                count++;
                return;
            }
            api.removePrefs({
                key: 'uid'
            });
            api.removePrefs({
                key: 'familyuid'
            });
            ns.post({
                action: 'dologin',
                Username: that.form.username,
                Password: that.form.password,
                device_type: that.form.device_type,
                device_id: that.form.device_id,
                openid: that.form.openid,
                logintype: that.form.logintype
            }, function(succeed, data, err) {
                if (succeed) {
                    if (data.needphone) {
                        api.alert({
                            title: '提示',
                            msg: '第一次绑定，需要前去完善资料',
                        }, function(ret, err) {
                            ns.openWin('myphoneconfirm_frm', '完善资料', {
                                title: '完善资料',
                                url: 'myphoneconfirm_frm.html',
                                openid: that.form.openid,
                                type: that.form.logintype
                            });
                        });
                        return;
                    }
                    if (data.firstlogin) {
                        api.alert({
                            title: '提示',
                            msg: '第一次登陆，需要前去设置密码',
                        }, function(ret, err) {
                            ns.openWin('mypwdconfirm_frm', '设置密码', {
                                title: '设置密码',
                                url: 'mypwdconfirm_frm.html',
                                openid: that.form.openid,
                                type: that.form.logintype
                            });
                        });
                        return;
                    }
                    api.toast({
                        msg: '登录成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    if (data.uid) {
                        api.setPrefs({
                            key: 'uid',
                            value: data.uid
                        });
                    }
                    if (data.familyuid) {
                        api.setPrefs({
                            key: 'familyuid',
                            value: data.familyuid
                        });
                    }
                    api.sendEvent({
                        name: 'onlogin'
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
                    api.setPrefs({
                        key: 'cid',
                        value: that.form.device_id || ''
                    });
                }
            });
        },
        do_retrieve: function() {
            var that = this;
            ns.openWin('dl_retrievepwd_frm', '找回密码');
        },
        wx_login: function() {
            var that = this;
            wx.auth({}, function(ret, err) {
                if (ret.status) {
                    that.wx_gettoken(ret.code);
                }
            });
        },
        wx_gettoken: function(code) {
            var that = this;
            wx.getToken({
                code: code
            }, function(ret, err) {
                if (ret.status) {
                    that.wx_getuserinfo(ret.accessToken, ret.openId)
                }
            });
        },
        wx_getuserinfo: function(token, openid) {
            var that = this;
            wx.getUserInfo({
                accessToken: token,
                openId: openid
            }, function(ret, err) {
                if (ret.status) {
                    that.form.openid = ret.openid;
                    that.form.logintype = 8;
                    that.do_login();
                } else {
                    api.toast({
                        msg: err.code,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        qq_login: function() {
            var that = this;
            qq.login(function(ret, err) {
                if (ret && ret.openId) {
                    that.form.openid = ret.openId;
                    that.form.logintype = 9;
                    that.do_login();
                }
            });
        },
        weibo_login: function() {
            var that = this;
            weibo.isInstalled(
                function(ret) {
                    if (ret.status) {
                        weibo.auth(function(ret, err) {
                            if (ret.status) {
                                that.form.openid = ret.userId;
                                that.form.logintype = 10;
                                that.do_login();
                            }
                        });
                    } else {
                        api.toast({
                            msg: '未安装新浪微博客户端',
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                }
            );
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    ajpush = api.require('ajpush');
    wx = api.require('wx');
    qq = api.require('QQPlus');
    weibo = api.require('weibo');
    toast = new auiToast();
    app.get_jiguang_register_id();
    app.form.device_type = api.systemType;
    app.get_data();
    app.get_thridlogin_auth();
    api.sendEvent({
        name: 'close_popup'
    })
};
