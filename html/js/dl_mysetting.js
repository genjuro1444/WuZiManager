var UIActionProgress, ns;
var app = new Vue({
    el: '#app',
    data: {},
    methods: {
        do_logout: function() {
            api.removePrefs({ key: 'uid' });
            api.removePrefs({ key: 'familyuid' });
            api.sendEvent({
                name: 'logout_complete'
            });
            setTimeout(function() {
                api.closeWin();
            }, 1000);
        },
        open_myphone: function(){
          var that = this;
          ns.openWin('dl_myphone_frm', '切换手机', {
              id: 0,
          });
        },
        open_mypaypassword: function(){
          var that = this;
          ns.openWin('dl_mypaypassword_frm', '交易密码', {
              id: 0,
          });
        },
        open_mypassword: function(){
          var that = this;
          ns.openWin('dl_mypassword_frm', '修改登录密码', {
              id: 0,
          });
        },
        checkupdate: function() {
            var that = this;
            ns.post({
                action: 'getappversion',
                version: api.appVersion,
                versiontype: api.systemType
            }, function(succeed, data, err) {
                if (succeed) {
                    var result = data;
                    if (result && result.update == true && result.closed == false) {
                        var str = '';
                        if (result.version) {
                            str += '新版本型号:' + result.version + ';';
                        }
                        if (result.versionDes) {
                            str += '更新描述:' + result.versionDes + ';';
                        }
                        if (result.time) {
                            str += '发布时间:' + result.time + ';';
                        }
                        api.confirm({
                            title: '有新的版本,是否下载并安装 ',
                            msg: str,
                            buttons: ['确定', '取消']
                        }, function(ret, err) {
                            if (ret.buttonIndex == 1) {
                                if (api.systemType == "android") {
                                    that.downloadapp(result.source);
                                }
                                if (api.systemType == "ios") {
                                    api.installApp({
                                        appUri: result.source
                                    });
                                }
                            }
                        });
                    } else {
                        api.toast({
                            msg: '当前版本是最新版本',
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                } else if (err) {
                    api.toast({
                        msg: '当前版本是最新版本',
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        downloadapp: function(url) {
            var that = this;
            ns.confirmPer('storage', function() {
                that.downloadappprocss(url);
            })
        },
        downloadappprocss: function(url) {
            var that = this;
            that.UIActionProgressOpen();
            api.download({
                url: url,
                report: true
            }, function(ret, err) {
                if (ret && 0 == ret.state) { /* 下载进度 */
                    that.UIActionProgressSetData(ret.percent);
                }
                if (ret && 1 == ret.state) { /* 下载完成 */
                    UIActionProgress.close();
                    var savePath = ret.savePath;
                    api.installApp({
                        appUri: savePath
                    });
                }
            });
        },
        UIActionProgressOpen: function() {
            UIActionProgress.open({
                maskBg: 'rgba(0,0,0,0.5)',
                styles: {
                    h: 108,
                    bg: '#fff',
                    title: {
                        size: 13,
                        color: '#000',
                        marginT: 10
                    },
                    msg: {
                        size: 12,
                        color: '#000',
                        marginT: 5
                    },
                    lable: {
                        size: 12,
                        color: '#696969',
                        marginB: 5
                    },
                    progressBar: {
                        size: 2,
                        normal: '#000',
                        active: '#4876FF',
                        marginB: 35,
                        margin: 5
                    }
                },
                data: {
                    title: '正在更新',
                    msg: '开始下载',
                    value: 0
                }
            }, function(ret) {
            });
        },
        UIActionProgressSetData: function(value) {
            UIActionProgress.setData({
                data: {
                    title: '正在更新...',
                    msg: '',
                    value: value
                }
            });
        },
        open_win: function(title, name, needroom) {
            var that = this;
            if (needroom) {
                ns.openWin(name, title, null, { needroom: true });
                return;
            }
            ns.openWin(name, title, null, { needlogin: true });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    UIActionProgress = api.require('UIActionProgress');
}
