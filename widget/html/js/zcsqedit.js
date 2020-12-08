var ns;
var actionsheet;
var app = new Vue({
    el: '#app',
    data: {
        hideeditbtn: false,
        canedit: false,
        canruku: false,
        form: {
            ID: 0,
            Code: '',
            Status: 0,
            StatusDesc: '',
            DeptName: '',
            DepartmentName: '',
            UserRealName: '',
            SharedDesc: '',
            Shared: 0
        },
        sqlist: [],
        source: 'zcsqedit',
        tabtype: 1,
        sqItemIndex: 0,
        loglist: [],
        imglist: [],
        imgindex: 0,
        img_count: 0,
        select_imglist: [],
        select_imgindex: 0,
        maxuploadcount: 9,
        currentItem: null
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'APP_GETZCSQGLMODEL',
                id: that.form.ID
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.data;
                    that.sqlist = data.list;
                    that.sqItemIndex = that.sqlist.length;
                    if (that.form.BranchCode <= 0) {
                        that.form.BranchCode = ns.Get_Branch_Code();
                    }
                    if (that.form.DeptName == null || that.form.DeptName == '') {
                        that.form.DeptName = ns.Get_Branch_Name();
                    }
                    that.loglist = data.loglist;
                    that.imglist = data.imglist;
                    that.imgindex = that.imglist.length;
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_save: function() {
            var that = this;
            if (that.form.BranchCode == '' || that.form.BranchCode == null) {
                ns.toast('请选择申请公司');
                return;
            }
            if (that.form.UserGW == '' || that.form.UserGW == null) {
                ns.toast('请选择申请部门');
                return;
            }
            var sqlist = [];
            for (var i = 0; i < that.sqlist.length; i++) {
                var item = that.sqlist[i];
                if (item.Name && Number(item.Qty) > 0) {
                    item.PresentPrice = Number(item.PresentPrice);
                    item.Depreciation = Number(item.Depreciation);
                    item.Qty = Number(item.Qty);
                    sqlist.push(item)
                }
            }
            if (sqlist.length == 0) {
                ns.toast('请填写申请单的资产信息');
                return;
            }
            var filelist = [];
            for (var i = 0; i < that.imglist.length; i++) {
                var item = that.imglist[i];
                if (item.isupload) {
                    filelist.push(item.url);
                }
            }
            var options = {
                action: 'APP_ADDZCSQGL',
                ID: that.form.ID,
                data: JSON.stringify(that.form),
                sqlist: JSON.stringify(sqlist)
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    ns.toast('保存成功');
                    app.reload_list();
                    setTimeout(function() {
                        api.closeWin();
                    }, 500);
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true,
                files: {
                    file: filelist
                }
            });
        },
        do_select_status: function() {
            var that = this;
            if (that.form.Shared == 1) {
                that.form.Shared = 0;
            } else {
                that.form.Shared = 1;
            }
        },
        do_select_company: function() {
            var that = this;
            var title = '选择申请公司';
            var name = 'choosecompany_frm';
            ns.openWin(name, title, {
                source: that.source,
                BranchCode: that.form.BranchCode
            });
        },
        do_select_department: function() {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择申请公司');
                return;
            }
            var title = '选择申请部门';
            var name = 'choosedepartment_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                source: that.source
            });
        },
        do_select_userstaff: function() {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择申请公司');
                return;
            }
            if (that.form.UserGW == '') {
                ns.toast('请选择申请部门');
                return;
            }
            var title = '选择申请人';
            var name = 'chooseuserstaff_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                userGW: that.form.UserGW,
                source: that.source
            });
        },
        do_open_operation: function() {
            var that = this;
            var name = 'zcsqeditbtn_frm';
            var url = 'zcsqeditbtn_frm.html';
            ns.openFrame(name, url, {
                type: 'push'
            }, {
                status: that.form.Status
            });
        },
        do_open_edit: function() {
            var that = this;
            var title = '申请单修改';
            var name = 'zcsqedit_frm_new';
            ns.openWin(name, title, {
                id: that.form.ID,
                canedit: true,
                cansavezcsq: true,
                hideeditbtn: true,
                url: 'zcsqedit_frm.html'
            });
        },
        open_cancel_sq: function() {
            var that = this;
            ns.confirm({
                msg: '确认作废申请单?'
            }, function() {
                api.closeFrame({
                    name: 'zcsqeditbtn_frm'
                });
                var options = {
                    action: 'APP_CANCELZCSQGLMODEL',
                    ID: that.form.ID
                }
                ns.post(options, function(succeed, data, err) {
                    if (succeed) {
                        ns.toast('作废成功');
                        app.reload_list();
                        setTimeout(function() {
                            api.closeWin();
                        }, 500);
                    } else if (err) {
                        ns.toast(err);
                    }
                }, {
                    toast: true
                });
            })
        },
        reload_list: function() {
            api.sendEvent({
                name: 'do_reload_zcsq_list'
            });
        },
        do_select_tab: function(type) {
            var that = this;
            that.tabtype = type;
        },
        do_add_sq_item: function() {
            var that = this;
            that.sqItemIndex++;
            that.sqlist.push({
                ID: 0,
                ZCSQId: 0,
                Name: '',
                Qty: '',
                index: that.sqItemIndex,
                TypeID: 0,
                PresentPrice: '',
                Depreciation: ''
            });
        },
        remove_sq: function(ID, index) {
            var that = this;
            ns.confirm({
                msg: '确认删除?'
            }, function() {
                if (ID > 0) {
                    ns.post({
                        action: 'APP_REMOVEZCSQZCMODEL',
                        ID: ID
                    }, function(succeed, data, err) {
                        if (succeed) {
                            that.do_delete_sq_zc(ID, index);
                        } else if (err) {
                            ns.toast(err);
                        }
                    }, {
                        toast: true
                    });
                } else {
                    that.do_delete_sq_zc(ID, index);
                }
            })
        },
        do_delete_sq_zc: function(ID, index) {
            var that = this;
            var removeIndex = -1;
            for (var i = 0; i < that.sqlist.length; i++) {
                var item = that.sqlist[i];
                if (item.ID == ID && ID > 0) {
                    removeIndex = i;
                    break;
                }
                if (item.index == index && index) {
                    removeIndex = i;
                    break;
                }
            }
            if (removeIndex >= 0) {
                that.sqlist.splice(removeIndex, 1);
            }
        },
        do_ruku: function(item) {
            var that = this;
            var title = '新增入库';
            var name = 'zcedit_frm';
            if (item.RuKuCount >= item.Qty) {
                ns.toast('当前申请单资产已全部入库');
                return;
            }
            ns.openWin(name, title, {
                sqzcid: item.ID,
                canedit: true,
                cansave: true,
                hideeditbtn: true,
                addmore: true,
            });
        },
        do_close: function() {
            api.closeWin();
        },
        do_open_ruku: function() {
            var that = this;
            var title = '选择资产';
            var name = 'zcsqedit_frm_new'
            ns.openWin(name, title, {
                canedit: false,
                cansavezcsq: false,
                cansavezcsqruku: true,
                id: that.form.ID,
                hideeditbtn: true,
                canruku: true,
                url: 'zcsqedit_frm.html'
            });
        },
        covertdate: function(datestr) {
            var t = new Date(datestr);
            var str = "";
            if (!isNaN(t)) {
                str = "<div class='small'>" + (t.getMonth() + 1) + "-" + t.getDate() + "</div>";
                str += "<div class='medium'>" + t.getFullYear() + "</div>";
            }
            return str;
        },
        do_add_sq_file: function() {
            var that = this;
            actionsheet.init({
                frameBounces: true, //当前页面是否弹动，（主要针对安卓端）
                cancelTitle: '关闭',
                buttons: ['拍照', '图库选择']
            }, function(ret) {
                if (ret) {
                    if (ret.buttonIndex == 1) {
                        that.take_picture();
                    } else if (ret.buttonIndex == 2) {
                        that.choose_picture();
                    }
                }
            })
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
                        id: 0,
                        isupload: true,
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
                quality: 80,
            }, function(ret, err) {
                if (ret && ret.data) {
                    that.imglist.push({
                        index: that.imgindex,
                        url: ret.data,
                        isupload: true
                    });
                    that.imgindex++;
                }
            });
        },
        remove_img: function(index) {
            var that = this;
            for (var i = 0; i < that.imglist.length; i++) {
                var item = that.imglist[i];
                if (item.index == index) {
                    that.imglist.splice(i, 1);
                }
            }
        },
        do_remove_image: function(item) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确定删除?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    if (item.ID <= 0) {
                        that.remove_img(item.index);
                    }
                    var options = {
                        action: 'APP_REMOVEZCSQFILE',
                        ID: that.form.ID,
                        FileID: item.ID,
                    }
                    ns.post(options, function(succeed, data, err) {
                        if (succeed) {
                            that.remove_img(item.index);
                        } else if (err) {
                            ns.toast(err);
                        }
                    }, {
                        toast: true
                    });
                }
            });
        },
        do_viewimages: function(activeIndex) {
            var that = this;
            var imageUrls = [];
            for (var i = 0; i < that.imglist.length; i++) {
                imageUrls.push(that.imglist[i].url);
            }
            var imageBrowser = api.require('imageBrowser');
            imageBrowser.openImages({
                showList: false,
                activeIndex: activeIndex,
                imageUrls: imageUrls
            });
        },
        do_select_type: function(item) {
            var that = this;
            var title = '选择资产分类';
            var name = 'choosezctype_frm';
            that.currentItem = item;
            ns.openWin(name, title, {
                source: that.source
            });
        },
        do_save_ruku: function() {
            var that = this;
            var options = {
                action: 'APP_ADDZCSQRUKU',
                ID: that.form.ID,
                sqlist: JSON.stringify(that.sqlist)
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    ns.toast('入库申请成功');
                    app.reload_list();
                    setTimeout(function() {
                        api.closeWin();
                    }, 500);
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true,
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.ID = ns.getPageParam('id') || 0;
    app.canedit = ns.getPageParam('canedit') || false;
    app.hideeditbtn = ns.getPageParam('hideeditbtn') || false;
    app.canruku = ns.getPageParam('canruku') || false;
    actionsheet = new auiActionsheet();
    setTimeout(function() {
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_choose_zctype_complete'
    }, function(ret) {
        if (ret.value && ret.value.source == app.source && app.currentItem != null) {
            app.currentItem.Title = ret.value.name;
            app.currentItem.TypeID = ret.value.id;
            app.currentItem.Depreciation = ret.value.monthage;
        }
    });
    api.addEventListener({
        name: 'do_save_zcsq'
    }, function() {
        app.do_save();
    });
    api.addEventListener({
        name: 'do_save_zcsq_ruku'
    }, function() {
        app.do_save_ruku();
    });
    api.addEventListener({
        name: 'do_close_zcsqedit'
    }, function() {
        app.do_close();
    });
    api.addEventListener({
        name: 'do_start_cancel_zcsq'
    }, function(ret) {
        app.open_cancel_sq();
    });
    api.addEventListener({
        name: 'do_start_ruku_zcsq'
    }, function(ret, err) {
        app.do_open_ruku();
    });
    api.addEventListener({
        name: 'do_start_edit_zcsq'
    }, function(ret) {
        app.do_open_edit();
    });
    api.addEventListener({
        name: 'do_choose_zccompany_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.BranchCode = ret.value.id;
                app.form.DeptName = ret.value.name;
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_zcdepartment_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                if (app.form.UserGW != ret.value.name) {
                    app.form.UserGW = ret.value.id;
                    app.form.DepartmentName = ret.value.name;
                    app.form.UserName = '';
                    app.form.UserRealName = '';
                }
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_zcuseuser_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.UserName = ret.value.id;
                app.form.UserRealName = ret.value.name;
            }
        }
    });
}
