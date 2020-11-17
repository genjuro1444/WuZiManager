var UIActionProgress;
var appupgrade = new Vue({
    el: '#appupgrade',
    data: {},
    methods: {
        check_upgrade: function(showerr) {
            var that = this;
            ns.post({
                action: 'getappversion',
                version: api.appVersion,
                versiontype: api.systemType,
                APPType: 1
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
                        if (result.isforceupdate) {
                            api.alert({
                                title: '有新的版本,是否下载并安装',
                                msg: str,
                            }, function(ret, err) {
                                if (api.systemType == "android") {
                                    that.downloadapp(result.source);
                                }
                                if (api.systemType == "ios") {
                                    api.installApp({
                                        appUri: result.source
                                    });
                                }
                            });
                            return;
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
                    }
                } else if (err) {
                    if (showerr) {
                        ns.toast(err);
                    }
                }
            }, {
                ismain: true
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
                // api.alert({ msg: JSON.stringify(ret) });
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
    }
});
