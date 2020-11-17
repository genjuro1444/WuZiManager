var ns;
var app = new Vue({
    el: '#app',
    data: {
        ProjectList: [],
        ServiceTypes: [],
        selected_address_info: '',
        form: {
            id: 0,
            RoomID: 0, //资源位置ID
            FullName: '', //资源位置名称
            PhoneNo: '', //联系电话
            UserName: '', //反馈人
            Content: '', //情况说明
            AppointTime: ''
        },
        ServiceTypeName: '', //投诉或建议
        SuggestionType: 2, //默认投诉建议 1:报事报修；2投诉建议
        ServiceType: 39, //35:投诉;39:建议
        imglist: [],
        imgindex: 0,
    },
    methods: {
        get_data: function() {
            var that = this;
            //alert(that.form.ServiceType);
            ns.post({
                action: 'getmyroomsourcelist'
            }, function(succeed, data, err) {
                if (succeed) {
                    //alert(JSON.stringify(data));
                    that.ProjectList = data.list;
                    that.form = data.form;
                }
            });
            var options = {};
            options.action = "getservicetype";
            options.TypeIdsStr = "2,3";
            options.ParentId = 0;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    //alert(JSON.stringify(data.ServiceTypes));
                    that.ServiceTypes = data.ServiceTypes;
                    that.ServiceType = data.ServiceTypes[0].ID;
                }
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
                quality: 100,
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
                quality: 100,
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
        do_open_add: function() {
            var that = this;
            if (that.form.RoomID == 0) {
                api.toast({
                    msg: '请选择房间',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.PhoneNo == '') {
                api.toast({
                    msg: '请填写联系电话',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.UserName == '') {
                api.toast({
                    msg: '请填写反馈人',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.Content == '') {
                api.toast({
                    msg: '请填写情况说明',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            this.do_save();
        },
        do_save: function() {
            var that = this;
            var filelist = [];
            for (var i = 0; i < that.imglist.length; i++) {
                filelist.push(that.imglist[i].url);
            }
            var options = {};
            options.RoomID = that.form.RoomID;
            options.FullName = that.form.FullName;
            options.PhoneNo = that.form.PhoneNo;
            options.Content = that.form.Content;
            options.UserName = that.form.UserName;
            options.ServiceType = that.ServiceType; //投诉及建议
            options.SuggestionType = that.SuggestionType;
            options.action = 'savenewbaoxiujianyi';
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form.Content = '';
                    that.imglist = [];
                    that.imgindex = 0;
                    api.toast({
                        msg: '提交成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    api.sendEvent({
                        name: 'reload_servicelist',
                    });
                    setTimeout(function() {
                        api.closeWin();
                    }, 500)
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
        do_change_typeid: function(id) {
            var that = this;
            that.ServiceType = id;
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.id = api.pageParam.id || 0;
    toast = new auiToast();
    app.get_data();
}
