var ns, FNScanner;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            canwrite: false,
            getids: false,
            getzcdetail: false,
            pandianroom: false,
            pandianzc: false,
            isclose: false,
            lightIsOn: false,
            id: 0,
            content: '',
            getlocationzclist: false,
        },
        zchtml: 'zc_detail.html',
        locationhtml: 'loczc_list.html',
        scansuccess: false
    },
    methods: {
        openScanView: function() {
            var that = this;
            FNScanner.qrScan(function(ret, err) {
                that.scansuccess = true;
                that.scanSuccess(ret.msg);
            });
        },
        scanSuccess: function(content) {
            var that = this;
            that.form.content = content.toLowerCase();
            if (that.form.content.indexOf(that.zchtml) > -1) {
                that.form.id = ns.getQueryString('id', that.form.content);
            } else if (that.form.content.indexOf(that.locationhtml) > -1) {
                that.form.id = ns.getQueryString('locationid', that.form.content);
            }
            if (that.form.getids || that.form.pandianzc) {
                if (that.form.content.indexOf(that.zchtml) == -1) {
                    api.alert({
                        title: '提示',
                        msg: '请扫描资产二维码',
                    }, function(ret, err) {
                        that.form.isclose = true;
                        that.closeScanner();
                    });
                    return;
                }
            }
            if (that.form.pandianroom) {
                if (that.form.content.indexOf(that.locationhtml) == -1) {
                    api.alert({
                        title: '提示',
                        msg: '请扫描场地二维码',
                    }, function(ret, err) {
                        that.form.isclose = true;
                        that.closeScanner();
                    });
                    return;
                }
            }
            if (!that.form.id) {
                api.alert({
                    title: '提示',
                    msg: '二维码无效，未获取到相关信息',
                }, function(ret, err) {
                    that.form.isclose = true;
                    that.closeScanner();
                });
                return;
            }
            if (that.form.getzcdetail) {
                if (that.form.content.indexOf(that.zchtml) > -1) {
                    that.form.getzcdetail = true;
                    that.form.getlocationzclist = false;
                } else if (that.form.content.indexOf(that.locationhtml) > -1) {
                    that.form.getzcdetail = false;
                    that.form.getlocationzclist = true;
                } else {
                    api.alert({
                        title: '提示',
                        msg: '请扫描资产或者场地二维码',
                    }, function(ret, err) {
                        that.form.isclose = true;
                        that.closeScanner();
                    });
                    return;
                }
            }
            that.closeScanner();
        },
        closeWin: function() {
            var that = this;
            setTimeout(function() {
                api.closeWin({
                    animation: {
                        type: 'none',
                        duration: 0
                    }
                });
            }, 200);
        },
        closeScanner: function() {
            var that = this;
            if (that.form.isclose) {
                that.closeWin();
                return;
            }
            setTimeout(function() {
                that.closeWin();
            }, 600);
            if (that.form.canwrite) {
                setTimeout(function() {
                    var title = '搜索';
                    var name = 'zcsearch_frm';
                    ns.openWin(name, title, {
                        getids: that.form.getids,
                        getzcdetail: that.form.getzcdetail,
                        source: 'scanner',
                        pandianroom: that.form.pandianroom,
                        pandianzc: that.form.pandianzc
                    });
                }, 500)
                return;
            }
            if (that.form.getids) {
                setTimeout(function() {
                    api.sendEvent({
                        name: 'do_getids_complete',
                        extra: {
                            id: that.form.id,
                        }
                    });
                }, 500)
                return;
            }
            if (that.form.getzcdetail) {
                var title = '资产详情';
                var name = 'zcedit_frm';
                setTimeout(function() {
                    ns.openWin(name, title, {
                        canedit: false,
                        cansave: false,
                        hideeditbtn: true,
                        id: that.form.id
                    });
                }, 500)
                return;
            }
            if (that.form.getlocationzclist) {
                setTimeout(function() {
                    var title = '资产列表';
                    var name = 'zcgl_scan_frm';
                    ns.openWin(name, title, {
                        canedit: false,
                        cansave: false,
                        cansearchzc: true,
                        LocationID: that.form.id
                    });
                }, 500)
                return;
            }
            if (that.form.pandianroom) {
                setTimeout(function() {
                    api.sendEvent({
                        name: 'do_open_pandianroom_page',
                        extra: {
                            id: that.form.id,
                        }
                    });
                }, 500)
                return;
            }
            if (that.form.pandianzc) {
                setTimeout(function() {
                    api.sendEvent({
                        name: 'do_complete_pandianzc',
                        extra: {
                            id: that.form.id,
                        }
                    });
                }, 500)
                return;
            }
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.getids = ns.getPageParam('getids') || false;
    app.form.getzcdetail = ns.getPageParam('getzcdetail') || false;
    app.form.pandianroom = ns.getPageParam('pandianroom') || false;
    app.form.pandianzc = ns.getPageParam('pandianzc') || false;
    FNScanner = api.require('easyQRCodeScan');
    app.openScanView();
    api.addEventListener({
        name: 'do_close_scan'
    }, function(ret) {
        app.form.canwrite = false;
        if (ret.value && ret.value.canwrite) {
            app.form.canwrite = true;
        }
        app.form.isclose = false;
        if (ret.value && ret.value.isclose) {
            app.form.isclose = true;
        }
        app.closeScanner();
    });
    api.addEventListener({
        name: 'resume'
    }, function(ret, err) {
        if (!app.scansuccess) {
            app.closeWin();
        }
    });
}
