var ns;
var app = new Vue({
    el: '#app',
    data: {
        hideeditbtn: false,
        canedit: false,
        form: {
            ID: 0
        },
        source: 'zcedit',
        tabtype: 1,
        addmore: false
    },
    methods: {
        get_data: function () {
            var that = this;
            ns.post({
                action: 'APP_GETZCGLMODEL',
                id: that.form.ID
            }, function (succeed, data, err) {
                if (succeed) {
                    that.form = data.data;
                    if (that.form.BranchCode <= 0) {
                        that.form.BranchCode = ns.Get_Branch_Code();
                    }
                    if (that.form.DeptName == null || that.form.DeptName == '') {
                        that.form.DeptName = ns.Get_Branch_Name();
                    }
                    if (that.form.Qty <= 0) {
                        that.form.Qty = 1;
                    }
                    that.loglist = data.loglist;
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                    toast: true
                });
        },
        do_save: function () {
            var that = this;
            if (that.form.Name == '' || that.form.Name == null) {
                ns.toast('资产名称不能为空');
                return;
            }
            if (that.form.TypeID <= 0) {
                ns.toast('资产分类不能为空');
                return;
            }
            //if (that.form.BrandName == '' || that.form.BrandName == null) {
            //    ns.toast('品牌不能为空');
            //    return;
            //}
            that.form.RegistDate = that.form.RegistDateDesc;
            var options = {
                action: 'APP_ADDZCGL',
                ID: that.form.ID,
                Qty: that.form.Qty,
                data: JSON.stringify(that.form)
            }
            ns.post(options, function (succeed, data, err) {
                if (succeed) {
                    ns.toast('保存成功');
                    app.reload_list();
                    setTimeout(function () {
                        api.closeWin();
                    }, 500);
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                    toast: true
                });
        },
        do_select_date: function () {
            var that = this;
            api.openPicker({
                type: 'date',
                date: that.form.RegistDateDesc,
                title: '选择日期'
            }, function (ret, err) {
                if (ret) {
                    var year = ret.year;
                    var month = (ret.month >= 10 ? ret.month : '0' + ret.month);
                    var day = (ret.day >= 10 ? ret.day : '0' + ret.day);
                    that.form.RegistDateDesc = year + '-' + month + '-' + day;
                }
            });
        },
        do_select_status: function () {
            var that = this;
            if (that.form.Shared == 1) {
                that.form.Shared = 0;
            } else {
                that.form.Shared = 1;
            }
        },
        do_select_type: function () {
            var that = this;
            var title = '选择资产分类';
            var name = 'choosezctype_frm';
            ns.openWin(name, title);
        },
        do_select_company: function () {
            var that = this;
            var title = '选择领用公司';
            var name = 'choosecompany_frm';
            ns.openWin(name, title, {
                source: that.source,
                BranchCode: that.form.BranchCode
            });
        },
        do_select_department: function () {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择公司');
                return;
            }
            var title = '选择领用部门';
            var name = 'choosedepartment_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                source: that.source
            });
        },
        do_select_userstaff: function () {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择公司');
                return;
            }
            if (that.form.UserGW == '') {
                ns.toast('请选择部门');
                return;
            }
            var title = '选择使用人';
            var name = 'chooseuserstaff_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                userGW: that.form.UserGW,
                source: that.source
            });
        },
        do_select_location: function () {
            var that = this;
            var title = '选择存放地点';
            var name = 'chooselocation_frm';
            ns.openWin(name, title, {
                canchooselocation: true,
                source: that.source
            });
        },
        do_open_operation: function () {
            var that = this;
            var name = 'zceditbtn_frm';
            var url = 'zceditbtn_frm.html';
            ns.openFrame(name, url, {
                type: 'push'
            }, {
                    status: that.form.Status
                });
        },
        open_lingyong: function () {
            var that = this;
            var title = '资产领用';
            var name = 'zclingyong_frm';
            ns.openWin(name, title, {
                zcid: that.form.ID,
                canlingyong: true,
                canedit: true,
                hideeditbtn: true
            });
        },
        open_fenpei: function () {
            var that = this;
            var title = '资产分配';
            var name = 'zcfenpei_frm';
            ns.openWin(name, title, {
                zcid: that.form.ID,
                canedit: true,
                canfenpei: true,
                hideeditbtn: true
            });
        },
        open_tuiku: function () {
            var that = this;
            var title = '资产退库';
            var name = 'zctuiku_frm';
            ns.openWin(name, title, {
                zcid: that.form.ID,
                cantuiku: true,
                canedit: true,
                hideeditbtn: true
            });
        },
        open_changelingyong: function () {
            var that = this;
            var title = '资产变更领用人';
            var name = 'zcchangelingyong_frm';
            ns.openWin(name, title, {
                id: that.form.ID,
                canchangelingyong: true,
                canedit: true,
                hideeditbtn: true
            });
        },
        open_borrow: function () {
            var that = this;
            var title = '资产借用';
            var name = 'zcborrow_frm';
            ns.openWin(name, title, {
                zcid: that.form.ID,
                canborrow: true,
                canedit: true,
                hideeditbtn: true
            });
        },
        open_borrowback: function () {
            var that = this;
            var title = '资产归还';
            var name = 'zcborrowback_frm';
            ns.openWin(name, title, {
                zcid: that.form.ID,
                canback: true,
                canedit: true,
                hideeditbtn: true
            });
        },
        open_edit_zc: function () {
            var that = this;
            var title = '编辑资产';
            var name = 'zcedit_frm_new';
            var cansave = true;
            var canedit = true;
            var hideeditbtn = true;
            ns.openWin(name, title, {
                canedit: canedit,
                cansave: cansave,
                id: that.form.ID,
                hideeditbtn: hideeditbtn,
                url: 'zcedit_frm.html'
            });
        },
        open_remove_zc: function () {
            var that = this;
            ns.confirm({
                msg: '确认删除?'
            }, function () {
                api.closeFrame({
                    name: 'zceditbtn_frm'
                });
                var options = {
                    action: 'APP_DELZCGLMODEL',
                    ID: that.form.ID
                }
                ns.post(options, function (succeed, data, err) {
                    if (succeed) {
                        ns.toast('删除成功');
                        app.reload_list();
                        setTimeout(function () {
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
        reload_list: function () {
            api.sendEvent({
                name: 'do_reload_zc_list'
            });
        },
        do_select_tab: function (type) {
            var that = this;
            that.tabtype = type;
        },
        covertdate: function (datestr) {
            var t = new Date(datestr);
            var str = "";
            if (!isNaN(t)) {
                str = "<div class='small'>" + (t.getMonth() + 1) + "-" + t.getDate() + "</div>";
                str += "<div class='medium'>" + t.getFullYear() + "</div>";
            }
            return str;
        },
    }
});
apiready = function () {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.ID = ns.getPageParam('id') || 0;
    app.canedit = ns.getPageParam('canedit') || false;
    app.hideeditbtn = ns.getPageParam('hideeditbtn') || false;
    app.addmore = ns.getPageParam('addmore') || false;
    setTimeout(function () {
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_save_zc'
    }, function () {
        app.do_save();
    });
    api.addEventListener({
        name: 'do_choose_zctype_complete'
    }, function (ret) {
        if (ret.value) {
            app.form.Title = ret.value.name;
            app.form.TypeID = ret.value.id;
            app.form.Depreciation = ret.value.monthage;
        }
    });
    api.addEventListener({
        name: 'do_start_edit_zc'
    }, function (ret) {
        app.open_edit_zc();
    });
    api.addEventListener({
        name: 'do_start_lingyong_add'
    }, function (ret) {
        app.open_lingyong();
    });
    api.addEventListener({
        name: 'do_start_fenpei_add'
    }, function (ret) {
        app.open_fenpei();
    });
    api.addEventListener({
        name: 'do_start_tuiku_add'
    }, function (ret) {
        app.open_tuiku();
    });
    api.addEventListener({
        name: 'do_start_changelingyong_add'
    }, function (ret) {
        app.open_changelingyong();
    });
    api.addEventListener({
        name: 'do_start_borrow_add'
    }, function (ret) {
        app.open_borrow();
    });
    api.addEventListener({
        name: 'do_start_borrowback_add'
    }, function (ret) {
        app.open_borrowback();
    });
    api.addEventListener({
        name: 'do_start_remove_zc'
    }, function (ret) {
        app.open_remove_zc();
    });
    api.addEventListener({
        name: 'do_choose_zccompany_complete'
    }, function (ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.BranchCode = ret.value.id;
                app.form.DeptName = ret.value.name;
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_zcdepartment_complete'
    }, function (ret) {
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
    }, function (ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.UserName = ret.value.id;
                app.form.UserRealName = ret.value.name;
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_location_complete'
    }, function (ret) {
        if (ret.value.source == app.source) {
            if (ret.value && ret.value.id) {
                app.form.LocationID = ret.value.id;
            }
            if (ret.value && ret.value.name) {
                app.form.LocTitle = ret.value.name;
            }
        }
    });
}
