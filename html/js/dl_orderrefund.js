var ns, actionsheet, toast;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            ID: 0,
            Content: '',
            currentsize: 0,
            maxsize: 140
        },
        imglist: [],
        imgindex: 0,
        isrefund: true,
        refund: [],
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getmallorderrefunddetails',
                id: that.form.ID
            }, function(succeed, data, err) {
                if (succeed) {
                    that.refund = data;
                }
            });
        },
        do_save: function() {
            var that = this;
            if (that.form.Content == "") {
                api.toast({
                    msg: '请填写退款理由',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            var filelist = [];
            for (var i = 0; i < that.imglist.length; i++) {
                filelist.push(that.imglist[i].url);
            }
            var options = {};
            options.ID = that.form.ID;
            options.Content = that.form.Content;
            options.action = 'savemallorderrefund';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '提交成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    api.sendEvent({
                        name: 'onorderrefund',
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
                files: {
                    file: filelist
                },
                toast: true
            });
        },
        openActionsheet: function() {
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
                if (ret) {
                    if (ret.buttonIndex == 1) {
                        that.take_picture();
                    } else if (ret.buttonIndex == 2) {
                        that.choose_picture();
                    }
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
                quality: 90,
                saveToPhotoAlbum: false
            }, function(ret, err) {
                if (ret && ret.data) {
                    that.imglist.push({
                        index: that.imgindex,
                        url: ret.data
                    });
                    that.imgindex++;
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
                quality: 90,
            }, function(ret, err) {
                if (ret && ret.data) {
                    that.imglist.push({
                        index: that.imgindex,
                        url: ret.data
                    });
                    that.imgindex++;
                }
            });
        },
        remove_img: function(index) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确定删除?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    for (var i = 0; i < that.imglist.length; i++) {
                        var item = that.imglist[i];
                        if (item.index == index) {
                            that.imglist.splice(i, 1);
                        }
                    }
                }
            });
        },
        input_change: function() {
            var that = this;
            var length = (that.form.maxsize - that.form.Content.length);
            if (length <= 0) {
                that.form.currentsize = that.form.maxsize;
                return;
            }
            that.form.currentsize = that.form.Content.length;
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.form.ID = api.pageParam.id;
    app.isrefund = api.pageParam.type == 101 ? false : true;
    app.get_data();
};
