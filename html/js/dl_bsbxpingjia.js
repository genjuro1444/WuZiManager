var ns, actionsheet, toast;
var app = new Vue({
    el: '#app',
    data: {
        commentlist: [],
        ratelist: [
            { index: 1, israte: false },
            { index: 2, israte: false },
            { index: 3, israte: false },
            { index: 4, israte: false },
            { index: 5, israte: false },
        ],
        form: {
            ID: 0,
            Content: '', //评价内容
            CategoryID: 0,
            RateCount: 0, //星级
            currentsize: 0,
            maxsize: 140
        },
        imglist: [],
        imgindex: 0,
        IsRated: false,
        IsZhuiJia: false
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.ID = that.form.ID;
            options.action = 'getserviceratelist';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.commentlist = data.commentlist;
                    that.IsRated = data.IsRated;
                }
            });
        },
        do_rate: function(item) {
            var that = this;
            for (var i = 0; i < that.ratelist.length; i++) {
                if (that.ratelist[i].index <= item.index) {
                    that.ratelist[i].israte = true;
                    continue;
                }
                that.ratelist[i].israte = false;
            }
            that.form.RateCount = item.index;
        },
        do_zuijia: function() {
            var that = this;
            that.IsZhuiJia = true;
            that.IsRated = false;
        },
        do_close: function() {
            api.closeWin();
        },
        do_save: function() {
            var that = this;
              //&& !that.IsZhuiJia
            if (that.form.RateCount == 0 ) {
                api.toast({
                    msg: '请选择评价星级',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.Content == "") {
                api.toast({
                    msg: '您什么都没有留下',
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
            options.RateCount = that.form.RateCount;
            options.action = 'saveservicerate';
            options.IsZhuiJia = that.IsZhuiJia
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '提交成功',
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
            }, { files: { file: filelist }, toast: true });
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
                    that.imglist.push({ index: that.imgindex, url: ret.data });
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
                    that.imglist.push({ index: that.imgindex, url: ret.data });
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
    app.get_data();
};
