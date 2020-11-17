var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            ID: 0
        },
        file: {
            headimg: '../image/default_user.png',
            isupload: false,
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            var uid = ns.getPrefs('uid');
            var options = {
                action: 'APP_GETMYSELFMODEL',
                P1: uid
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.data;
                    if (data.headimg) {
                        that.file.headimg = CONFIG.url + data.headimg;
                    }
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_save: function() {
            var that = this;
            var options = {
                action: 'APP_SAVEMYSELFMODEL',
                P1: JSON.stringify(that.form)
            }
            var filelist = [];
            if (that.file.isupload && that.file.headimg != '') {
                filelist.push(that.file.headimg);
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    ns.toast('保存成功');
                    that.reload_list();
                    setTimeout(function() {
                        api.closeWin();
                    }, 500);
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true,
                toastmsg: '提交中',
                files: {
                    file: filelist
                }
            });
        },
        reload_list: function() {
            api.sendEvent({
                name: 'do_reload_homeself'
            });
        },
        do_select_sex: function(sex) {
            var that = this;
            that.form.Sex = sex;
        },
        choose_img: function() {
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
                    that.file.isupload = true;
                    that.file.headimg = ret.data;
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
                    that.file.isupload = true;
                    that.file.headimg = ret.data;
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    setTimeout(function() {
        app.get_data();
    }, 500);
}
