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
        locationhtml: 'loczc_list.html'
    },
    methods: {
        openScanView: function() {
            var that = this;
            var frameWidth = api.frameWidth;
            var frameHeight = api.frameHeight;
            var w = frameWidth;
            var h = frameHeight;
            var x = 0;
            var y = 0;
            FNScanner.openView({
                // sound: 'fs://res/ding.wav',
                rect: {
                    x: x,
                    y: y,
                    w: w,
                    h: h
                },
                autorotation: false,
                isDrawQRCodeRect: false,
                interval: 3
            }, function(ret, err) {
                if (ret) {
                    if (ret.eventType == "show") {
                        setTimeout(function() {
                            that.openCover(x, y, w, h);
                        }, 100);
                        // FNScanner.switchLight({
                        //     status: 'off'
                        // });
                    }
                    if (ret.eventType == "success") {
                        // api.startPlay({
                        //     path: 'widget://res/ding.wav'
                        // }, function(ret, err) {
                        // });
                        that.form.content = ret.content.toLowerCase();
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
                                msg: '二维码无效，为获取到相关信息',
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
                    }
                } else {
                    // alert(JSON.stringify(err));
                    closeScanner();
                }
            });
        },
        openCover: function(x, y, w, h) {
            var that = this;
            ns.openFrame('scancover_frm', 'scancover_frm.html', {
                x: x,
                y: y,
                w: w,
                h: h
            }, {
                canwritezc: !that.form.pandianroom
            });
        },
        closeWin: function() {
            var that = this;
            FNScanner = api.require('FNScanner');
            api.closeFrame({
                name: 'scancover_frm'
            });
            setTimeout(function() {
                FNScanner.closeView();
                FNScanner.onResume();
                api.closeWin();
            }, 100);
        },
        closeScanner: function() {
            var that = this;
            if (that.form.isclose) {
                that.closeWin();
                return;
            }
            if (that.form.canwrite) {
                api.sendEvent({
                    name: 'do_open_write_page',
                    extra: {
                        getids: that.form.getids,
                        getzcdetail: that.form.getzcdetail,
                        pandianroom: that.form.pandianroom,
                        pandianzc: that.form.pandianzc
                    }
                });
                return;
            }
            if (that.form.id <= 0) {
                return;
            }
            if (that.form.getids) {
                api.sendEvent({
                    name: 'do_getids_complete',
                    extra: {
                        id: that.form.id,
                    }
                });
                return;
            }
            if (that.form.getzcdetail) {
                api.sendEvent({
                    name: 'do_open_zcdetail_page',
                    extra: {
                        id: that.form.id,
                    }
                });
                return;
            }
            if (that.form.getlocationzclist) {
                api.sendEvent({
                    name: 'do_open_zclist_page',
                    extra: {
                        id: that.form.id,
                    }
                });
                return;
            }
            if (that.form.pandianroom) {
                api.sendEvent({
                    name: 'do_open_pandianroom_page',
                    extra: {
                        id: that.form.id,
                    }
                });
                return;
            }
            if (that.form.pandianzc) {
                api.sendEvent({
                    name: 'do_complete_pandianzc',
                    extra: {
                        id: that.form.id,
                    }
                });
                return;
            }
        },
        switchLight: function() {
            var that = this;
            status = that.form.lightIsOn ? 'on' : 'off';
            FNScanner = api.require('FNScanner');
            FNScanner.switchLight({
                status: status
            });
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
        name: 'do_switch_light'
    }, function(ret) {
        app.form.lightIsOn = false;
        if (ret.value && ret.value.lightIsOn) {
            app.form.lightIsOn = true;
        }
        app.switchLight();
    });
    api.addEventListener({
        name: 'pause'
    }, function(ret, err) {
        FNScanner.onPause();
    });
    api.addEventListener({
        name: 'resume'
    }, function(ret, err) {
        FNScanner.onResume();
    });
}
