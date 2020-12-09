var header_h, ajpush, ns;
var trycount = 0;
var app = new Vue({
    el: '#app',
    data: {
        device_id: '',
        device_type: '',
        count: 0,
    },
    methods: {
        openFrame: function() {
            var that = this;
            that.count++;
            var uid = ns.getPrefs('uid');
            if (uid) {
                ns.openFrame('home_index_' + that.count, './home_index.html');
            } else {
                ns.openFrame('login_' + that.count, './html/login_win.html');
            }
        },
        //保存极光用户注册id
        save_jg_cid: function() {
            var that = this;
            ajpush.getRegistrationId(function(ret, err) {
                if (ret && ret.id) {
                    that.device_id = ret.id;
                    ns.post({
                        device_id: that.device_id,
                        device_type: that.device_type,
                        action: 'APP_SAVEPUSHDEVICEID'
                    }, function(succeed, data, err) {}, {
                        ismain: true
                    });
                }
            });
        },
        //初始化
        jp_init: function() {
            var that = this;
            if (that.device_type == 'android') {
                ajpush.init(function(ret, err) {});
            }
            setTimeout(function() {
                that.jp_setListener();
                that.jp_Add_Listener();
                that.jp_Resume_Push();
                var uid = ns.getPrefs('uid');
                if (uid) {
                    that.save_jg_cid();
                }
                ajpush.setBadge({
                    badge: 0
                });
            }, 2000);
        },
        //APP界面打开状态获取消息
        jp_setListener: function() {
            var that = this;
            ajpush.setListener(function(ret, err) {
                if (ret && ((ret.title && that.device_type == 'ios') || that.device_type == 'android')) {
                    var rep = ret.extra;
                    var uid = ns.getPrefs('uid');
                    if (uid) {
                        ajpush.setBadge({
                            badge: 0
                        });
                        that.jp_process(rep, true);
                    } else {
                        api.sendEvent({
                            name: 'onlogin'
                        });
                    }
                }
            });
        },
        //APP界面隐藏状态获取消息
        jp_Add_Listener: function() {
            var that = this;
            api.addEventListener({
                name: 'appintent'
            }, function(ret, err) {
                if (ret && ret.appParam.ajpush) {
                    var rep = ret.appParam.ajpush.extra;
                    var uid = ns.getPrefs('uid');
                    if (uid) {
                        that.jp_process(rep, true);
                    } else {
                        api.sendEvent({
                            name: 'onlogin'
                        });
                    }
                }
            });
            api.addEventListener({
                name: 'noticeclicked'
            }, function(ret, err) {
                if (ret && ret.value) {
                    var rep = ret.value.extra;
                    var uid = ns.getPrefs('uid');
                    if (uid) {
                        ajpush.setBadge({
                            badge: 0
                        })
                        that.jp_process(rep, true);
                    } else {
                        api.sendEvent({
                            name: 'onlogin'
                        });
                    }
                }
            });
            api.addEventListener({
                name: 'pause'
            }, function(ret, err) {
                ajpush.onPause(); //监听应用进入后台
                that.jp_Resume_Push();
            });
            api.addEventListener({
                name: 'resume'
            }, function(ret, err) {
                ajpush.onResume(); //监听应用恢复到前台
                that.jp_Resume_Push();
            });
        },
        //断开重连
        jp_Resume_Push: function() {
            var that = this;
            if (that.jg_timeout) {
                clearTimeout(that.jg_timeout);
                that.jg_timeout = null;
            }
            setTimeout(function() {
                that.jp_resumePush();
            }, 1000);
        },
        //断开重连
        jp_resumePush: function() {
            var that = this;
            ajpush.isPushStopped(function(ret, err) {
                if (!ret || ret.isStopped != 0) {
                    ajpush.resumePush(function(ret, err) {});
                }
                that.jg_timeout = setTimeout(function() {
                    that.jp_resumePush();
                }, 10 * 1000);
            });
        },
        jp_openwin: function(name, title, params) {
            var that = this;
            api.closeToWin({
                name: 'root'
            });
            setTimeout(function() {
                ns.openWin(name, title, params, {
                    ismain: true
                });
            }, 500);
        },
        jp_process: function(rep, pop_required) {
            var that = this;
            if (rep.sound) {
                api.startPlay({
                    path: rep.sound
                }, function(ret, err) {});
            }
            var title = '';
            var name = '';
            var params = {};
            var code = rep.code;
            if (code == 100) {
                title = '通知消息';
                name = 'messagedetail_frm';
                params = {
                    title: title,
                    url: name + '.html',
                    id: rep.id
                }
                api.sendEvent({
                    name: 'getmessagecount',
                });
            }
            if (code) {
                if (pop_required) {
                    api.confirm({
                        title: '提示',
                        msg: rep.msg,
                        buttons: ['稍后再说', '点击查看']
                    }, function(ret, err) {
                        var index = ret.buttonIndex;
                        if (index == 2) {
                            that.jp_openwin(name, title, params);
                        }
                    });
                } else {
                    that.jp_openwin(name, title, params);
                }
            }
        },
        set_status_bar: function() {
            var that = this;
            if (api.systemType != 'ios') {
                api.setStatusBarStyle({
                    color: '#000',
                });
            } else {
                api.setStatusBarStyle({
                    style: 'dark'
                });
            }
        }
    }
});
var stop_count = 0;
apiready = function() {
    api.parseTapmode();
    UIActionProgress = api.require('UIActionProgress');
    ns = window.Foresight.Util;
    app.set_status_bar();
    app.device_type = api.systemType;
    ajpush = api.require('ajpush');
    app.jp_init();
    app.openFrame();
    api.addEventListener({
        name: 'onlogin'
    }, function() {
        setTimeout(function() {
            api.closeToWin({
                name: 'root'
            });
        }, 1000);
        setTimeout(function() {
            app.openFrame();
        }, 500);
    });
    var last_out_time;
    api.addEventListener({
        name: 'keyback'
    }, function(ret, err) {
        if (last_out_time && last_out_time.valueOf() >= (new Date().valueOf() - 1000)) {
            api.closeWidget({
                silent: true
            });
            return;
        }
        last_out_time = new Date();
        api.toast({
            msg: '再按一次退出程序',
            duration: 1000
        });
    });
};
