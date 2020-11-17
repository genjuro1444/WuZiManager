var ns, actionsheet, toast, artEditor, map;
var app = new Vue({
    el: '#app',
    data: {
        categorylist: [],
        form: {
            CategoryID: 0,
            CityName: ''
        },
        list: [],
    },
    methods: {
        get_map_city: function() {
            var that = this;
            map.getLocation({
                accuracy: '10m',
                autoStop: true,
                filter: 1
            }, function(ret, err) {
                map.getNameFromCoords({
                    lon: ret.lon,
                    lat: ret.lat
                }, function(ret, err) {
                    if (ret.status) {
                        that.form.CityName = ret.city;
                    }
                });
            });
        },
        get_data: function() {
            var that = this;
            that.get_map_city();
            ns.post({
                action: 'getmallcategorylist',
                type: 'threadcategory',
                onlycategory: true
            }, function(succeed, data, err) {
                if (succeed) {
                    that.categorylist = data.servicelist;
                }
            });
        },
        do_tag_select: function(item) {
            var that = this;

            for (var i = 0; i < that.categorylist.length; i++) {
                that.categorylist[i].selected = false;
            }
            item.selected = true;
            that.form.CategoryID = item.id;
        },
        do_reset: function() {
            var that = this;
            for (var i = 0; i < that.categorylist.length; i++) {
                that.categorylist[i].selected = false;
            }
            that.form.CategoryID = 0;
        },
        do_save: function() {
            var that = this;
            if (that.form.CategoryID == 0) {
                api.toast({
                    msg: '请选择标签',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.list.length == 0) {
                api.toast({
                    msg: '您什么都没有留下',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            var filelist = [];
            var indexlist = [];
            for (var i = 0; i < that.list.length; i++) {
                if (that.list[i].type == 'image' && that.list[i].id == 0) {
                    filelist.push(that.list[i].content);
                    indexlist.push(i);
                }
            }
            var options = {};
            options.action = 'savethreadpost';
            options.list = JSON.stringify(that.list);
            options.CategoryID = that.form.CategoryID;
            options.CityName = that.form.CityName;
            options.type = 1;
            options.imageindexs = JSON.stringify(indexlist);
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.do_reset();
                    api.sendEvent({
                        name: 'updatabbs',
                        extra: {
                            key1: 'value1',
                        }
                    });

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
        do_insert: function(index) {
            var that = this;
            api.actionSheet({
                cancelTitle: '取消',
                buttons: ['文字', '拍照', '图库选择']
            }, function(ret, err) {
                if (ret) {
                    if (ret.buttonIndex == 1) {
                        that.insert_content(index, 1);
                    } else if (ret.buttonIndex == 2) {
                        that.take_picture(index);
                    } else if (ret.buttonIndex == 3) {
                        that.choose_picture(index);
                    }
                }
            });
        },
        take_picture: function(index) {
            var that = this;
            ns.confirmPer('camera', function() {
                that.take_picture_process(index);
            })
        },
        take_picture_process: function(index) {
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
                    that.insert_content(index, 2, ret.data);
                }
            });
        },
        choose_picture: function(index) {
            var that = this;
            ns.confirmPer('camera', function() {
                that.choose_picture_process(index);
            })
        },
        choose_picture_process: function(index) {
            var that = this;
            api.getPicture({
                sourceType: 'album',
                encodingType: 'jpg',
                mediaValue: 'pic',
                destinationType: 'url',
                allowEdit: true,
                quality: 50,
            }, function(ret, err) {
                if (ret && ret.data) {
                    that.insert_content(index, 2, ret.data);
                }
            });
        },
        insert_content: function(index, type, content) {
            var that = this;
            var item = null;
            if (type == 1) {
                item = {
                    id: 0,
                    content: '',
                    type: 'text'
                };
            } else if (type == 2) {
                item = {
                    id: 0,
                    content: content,
                    type: 'image'
                };
            }
            if (index == -1) {
                that.list.push(item);
                return;
            }
            var newlist = [];
            for (var i = 0; i < that.list.length; i++) {
                var current = that.list[i];
                if (i < index) {
                    newlist.push((current));
                }
                if (i == index) {
                    newlist.push(current);
                    newlist.push(item);
                }
                if (i > index) {
                    newlist.push(current);
                }
            }
            that.list = newlist;
        },
        do_remove: function(item, index) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确定删除?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    that.list.splice(index, 1);
                    if (item.id > 0) {
                        that.remove_server_content(item.id);
                    }
                }
            });
        },
        do_upper: function(index) {
            var that = this;
            var newlist = [];
            for (var i = 0; i < that.list.length; i++) {
                var current = that.list[i];
                if (i < index - 1) {
                    newlist.push((current));
                }
                if (i == index - 1) {
                    newlist.push(that.list[index]);
                    newlist.push(current);
                }
                if (i > index) {
                    newlist.push(current);
                }
            }
            that.list = newlist;
        },
    }
});
apiready = function() {
    api.parseTapmode();
    map = api.require('bMap');
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.get_data();
};
