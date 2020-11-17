var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            imageurl: '../image/default_user.png',
            nickname: '匿名用户',
            sex: '',
            birthday: '',
            phoneno: '',
            firstchangebirthday: true,
            firstchangenote: ''
        }
    },
    methods: {
        get_userinfo: function() {
            var that = this;
            ns.post({
                action: 'getuserinfo'
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form = data;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        image_cache: function(url) {
            var that = this;
            that.form.imageurl = url;
            api.imageCache({
                url: url,
                thumbnail: false
            }, function(ret, err) {
                if (ret.status) {
                    that.form.imageurl = ret.url;
                }
            });
        },
        choose_date: function() {
            var that = this;
            if (!that.form.firstchangebirthday) {
                return;
            }
            var date = '1980-01-01';
            if (that.form.birthday != '') {
                date = that.form.birthday;
            }
            api.openPicker({
                type: 'date',
                date: date,
            }, function(ret, err) {
                if (ret) {
                    var month = ret.month;
                    var day = ret.day;
                    month = (month < 10 ? '0' + month : '' + month);
                    day = (day < 10 ? '0' + day : '' + day);
                    that.form.birthday = ret.year + '-' + month + '-' + day;
                }
            });
        },
        choose_sex: function() {
            var that = this;
            api.actionSheet({
                cancelTitle: '关闭',
                buttons: ['男', '女']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    that.form.sex = '男';
                } else if (ret.buttonIndex == 2) {
                    that.form.sex = '女';
                }
                if (ret.buttonIndex != 3) {}
            });
        },
        choose_img: function() {
            var that = this;
            ns.confirmPer('camera', function() {
                that.openActionsheetProcess();
            })
        },
        openActionsheetProcess: function() {
            var that = this;
            api.actionSheet({
                cancelTitle: '关闭',
                buttons: ['拍照', '图库选择']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    that.take_picture();
                } else if (ret.buttonIndex == 2) {
                    that.choose_picture();
                }
            });
        },
        take_picture: function() {
            var that = this;
            api.getPicture({
                sourceType: 'camera',
                encodingType: 'jpg',
                mediaValue: 'pic',
                destinationType: 'url',
                allowEdit: true,
                quality: 80,
                saveToPhotoAlbum: false
            }, function(ret, err) {
                if (ret && ret.data) {
                    that.form.imageurl = ret.data;
                    that.do_save(true);
                }
            });
        },
        choose_picture: function() {
            var that = this;
            api.getPicture({
                sourceType: 'album',
                encodingType: 'jpg',
                mediaValue: 'pic',
                destinationType: 'url',
                allowEdit: true,
                quality: 80,
            }, function(ret, err) {
                if (ret && ret.data) {
                    that.form.imageurl = ret.data;
                    that.do_save(true);
                }
            });
        },
        open_win: function(title, name) {
            var that = this;
            ns.openWin(name, title, null, { needlogin: true });
        },
        do_save: function(isupload) {
            var that = this;
            if (isupload) {
                that.do_save_userinfo_process(isupload, false);
            }
            if (that.form.birthday == '') {
                api.toast({
                    msg: '请填写您的生日',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.firstchangebirthday) {
                api.confirm({
                    title: '提示',
                    msg: that.form.firstchangenote,
                    buttons: ['确定', '取消']
                }, function(ret, err) {
                    if (ret.buttonIndex == 1) {
                        that.do_save_userinfo_process(isupload, true);
                    }
                });
                return;
            }
            that.do_save_userinfo_process(true, true);
        },
        do_save_userinfo_process: function(isupload, savebirthday) {
            var that = this;
            var filelist = [];
            if (isupload && that.form.imageurl != '') {
                filelist.push(that.form.imageurl);
            }
            ns.post({
                action: 'saveuserinfo',
                sex: that.form.sex,
                birthday: that.form.birthday,
                savebirthday: savebirthday
            }, function(succeed, data, err) {
                if (succeed) {
                    if (data.headimg) {
                        api.setPrefs({ key: 'headimg', value: data.headimg });
                        api.sendEvent({
                            name: 'changeuserinfosuccess'
                        });
                        api.toast({
                            msg: '保存成功',
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, { files: { file: filelist } });
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_userinfo();
    api.addEventListener({
        name: 'changeuserinfosuccess'
    }, function() {
        app.get_userinfo();
    });
    api.addEventListener({
        name: 'do_open_save'
    }, function() {
        app.do_save();
    });
}
