var ns, actionsheet, toast;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            ID: 0,
            Content: '',
            CategoryID: 0,
            RateCount: 0,
            IsRated: false,
            currentsize: 0,
            maxsize: 140,
            mainrate: 0,
            shiprate: 0,
            servicerate: 0,
        },
        imglist: [],
        imgindex: 0,
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.ID = that.form.ID;
            options.action = 'getmallorderratestatus';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form.IsRated = data.IsRated;
                    if (that.form.IsRated) {
                        that.form.mainrate = data.RateStar;
                        that.form.shiprate = data.ShipRateStart;
                        that.form.servicerate = data.ServiceRateStart;
                        that.form.Content = data.Content;
                        that.imglist = data.imageList;
                    }
                }
            });
        },
        do_rate: function(index) {
            var that = this;
            if (that.form.IsRated) {
                return;
            }
            that.form.mainrate = index;
        },
        do_rate_ship: function(index) {
            var that = this;
            if (that.form.IsRated) {
                return;
            }
            that.form.shiprate = index;
        },
        do_rate_service: function(index) {
            var that = this;
            if (that.form.IsRated) {
                return;
            }
            that.form.servicerate = index;
        },
        do_save: function() {
            var that = this;
            if (that.form.IsRated) {
                return;
            }
            if (that.form.mainrate == 0) {
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
            options.RateCount = that.form.mainrate;
            options.servicerate = that.form.servicerate;
            options.shiprate = that.form.shiprate;
            options.action = 'savemallorderrate';
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
    app.get_data();
};
