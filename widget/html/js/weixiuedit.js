var ns;
var app = new Vue({
    el: '#app',
    data: {
        canedit: false,
        form: {
            ID: 0
        },
        zclist: [],
        zcform: {
            ID: 0,
        },
        source: 'weixiuedit',
        chosenids: '',
        hideeditbtn: false
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {
                action: 'APP_GETORDERMODEL',
                ID: that.form.ID,
                ZCID: that.zcform.ID,
                source: that.source
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.data;
                    if (that.form.BranchCode <= 0) {
                        that.form.BranchCode = ns.Get_Branch_Code();
                    }
                    if (that.form.DeptName == null || that.form.DeptName == '') {
                        that.form.DeptName = ns.Get_Branch_Name();
                    }
                    that.zclist = data.zclist;
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_save: function() {
            var that = this;
            if (!that.canedit) {
                return;
            }
            if (that.form.FromDateDesc == '' || that.form.FromDateDesc == null) {
                ns.toast('维修日期不能为空');
                return;
            }
            if (that.zclist.length == 0) {
                ns.toast('维修资产不能为空');
                return;
            }
            that.form.OrderStatus = 10;
            that.form.OrderTypeID = 60;
            that.form.FromDate = that.form.FromDateDesc;
            that.form.ToDate = that.form.ToDateDesc;
            that.form['Items'] = that.zclist;
            var options = {
                action: 'APP_BATCHORDER_WX',
                data: JSON.stringify(that.form)
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    ns.toast('维修单保存成功');
                    that.reload_list();
                    setTimeout(function() {
                        api.closeWin();
                    }, 1000);
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        reload_list: function() {
            api.sendEvent({
                name: 'do_reload_weixiu_form'
            });
            api.sendEvent({
                name: 'do_reload_weixiu_list'
            });
            api.sendEvent({
                name: 'do_reload_zc_list'
            });
        },
        do_select_date: function(type) {
            var that = this;
            var date = that.form.FromDateDesc;
            if (type == 2) {
                date = that.form.ToDateDesc;
            }
            api.openPicker({
                type: 'date',
                date: date,
                title: '选择日期'
            }, function(ret, err) {
                if (ret) {
                    var year = ret.year;
                    var month = (ret.month >= 10 ? ret.month : '0' + ret.month);
                    var day = (ret.day >= 10 ? ret.day : '0' + ret.day);
                    if (type == 2) {
                        that.form.ToDateDesc = year + '-' + month + '-' + day;
                    } else {
                        that.form.FromDateDesc = year + '-' + month + '-' + day;
                    }
                }
            });
        },
        do_select_company: function() {
            var that = this;
            var title = '选择维修公司';
            var name = 'choosecompany_frm';
            ns.openWin(name, title, {
                source: that.source,
                BranchCode: that.form.BranchCode
            });
        },
        do_select_department: function() {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择维修公司');
                return;
            }
            var title = '选择维修部门';
            var name = 'choosedepartment_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                source: that.source
            });
        },
        do_select_userstaff: function() {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择维修公司');
                return;
            }
            if (that.form.UserGW == '') {
                ns.toast('请选择维修部门');
                return;
            }
            var title = '选择维修人';
            var name = 'chooseuserstaff_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                userGW: that.form.UserGW,
                source: that.source
            });
        },
        do_select_zcitem: function(item) {
            var that = this;
            item.ischecked = !item.ischecked;
        },
        do_add_zc: function() {
            var that = this;
            var name = 'choosezc_frm';
            var title = '选择资产';
            var exceptids = '';
            if (that.chosenids != '') {
                var chosenidlist = eval('(' + that.chosenids + ')');
                if (chosenidlist.length > 0) {
                    exceptids = chosenidlist.join();
                }
            }
            ns.openWin(name, title, {
                canchoosezc: true,
                repairstatus: 0,
                exceptids: exceptids,
                disablechoosesrepairetatus: true
            });
        },
        do_open_scan: function() {
            var that = this;
            ns.openDirectWin('scanner_frm', '../html/scanner_frm.html', {
                getids: true
            })
        },
        do_remove_zc: function() {
            var that = this;
            var isselected = false;
            for (var i = 0; i < that.zclist.length; i++) {
                var item = that.zclist[i];
                if (item.ischecked) {
                    isselected = true;
                    break;
                }
            }
            if (!isselected) {
                return;
            }
            ns.confirm({
                msg: '确认删除?'
            }, function() {
                var newlist = [];
                var chosenarr = [];
                for (var i = 0; i < that.zclist.length; i++) {
                    var item = that.zclist[i];
                    if (!item.ischecked) {
                        newlist.push(item);
                        chosenarr.push(item.ID);
                    }
                }
                that.zclist = newlist;
                that.chosenids = '[' + chosenarr.join() + ']';
                ns.toast('删除成功');
            })
        },
        get_zc_byids: function(retids) {
            var that = this;
            var selectresult = retids;
            var selectarr = [];
            if (selectresult != '') {
                selectresult = selectresult.substring(1, selectresult.length - 1);
                selectarr = selectresult.split(",");
            }
            var chosenresult = that.chosenids;
            var chosenarr = [];
            if (chosenresult != '') {
                chosenresult = chosenresult.substring(1, chosenresult.length - 1);
                chosenarr = chosenresult.split(",");
            }
            that.chosenids = '[' + selectarr.concat(chosenarr) + ']';

            var options = {
                action: 'APP_GETZCLISTBYIDS',
                ids: that.chosenids,
                status: '[10,15,20,30,100]'
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.zclist = data.list;
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_open_operation: function() {
            var that = this;
            var name = 'weixiueditbtn_frm';
            var url = 'weixiueditbtn_frm.html';
            ns.openFrame(name, url, {
                type: 'push'
            }, {
                status: that.form.OrderStatus
            });
        },
        do_remove: function() {
            var that = this;
            ns.confirm({
                msg: '确认删除?'
            }, function() {
                api.closeFrame({
                    name: 'weixiueditbtn_frm'
                });
                var options = {
                    action: 'APP_DELORDER',
                    ID: that.form.ID
                }
                ns.post(options, function(succeed, data, err) {
                    if (succeed) {
                        ns.toast('删除成功');
                        that.reload_list();
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
        do_complete: function(_status) {
            var that = this;
            ns.confirm({
                msg: '确认' + (_status == 10 ? '取消' : '') + '完成该维修单?'
            }, function() {
                var options = {
                    action: 'APP_COMPLETEWX',
                    ID: that.form.ID,
                    Status: _status
                }
                ns.post(options, function(succeed, data, err) {
                    if (succeed) {
                        ns.toast((_status == 10 ? '取消' : '') + '完成成功');
                        that.reload_list();
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
        do_edit: function() {
            var that = this;
            var title = '修改维修单';
            var name = 'weixiuedit_frm_new';
            var cansave = true;
            var canedit = true;
            ns.openWin(name, title, {
                canedit: canedit,
                cansaveweixiu: cansave,
                id: that.form.ID,
                hideeditbtn: true,
                url: 'weixiuedit_frm.html'
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.ID = ns.getPageParam('id') || 0;
    app.zcform.ID = ns.getPageParam('zcid') || 0;
    app.canedit = ns.getPageParam('canedit') || false;
    app.hideeditbtn = ns.getPageParam('hideeditbtn') || false;
    setTimeout(function() {
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_save_weixiu'
    }, function() {
        if (!app.canedit) {
            return;
        }
        app.do_save();
    });
    api.addEventListener({
        name: 'do_choose_zccompany_complete'
    }, function(ret) {
        if (!app.canedit) {
            return;
        }
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
        if (!app.canedit) {
            return;
        }
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.UserGW = ret.value.id;
                app.form.DepartmentName = ret.value.name;
                app.form.UserName = '';
                app.form.UserRealName = '';
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_zcuseuser_complete'
    }, function(ret) {
        if (!app.canedit) {
            return;
        }
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.UserName = ret.value.id;
                app.form.UserRealName = ret.value.name;
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_zc_complete'
    }, function(ret) {
        if (!app.canedit) {
            return;
        }
        if (ret.value && ret.value.ids) {
            app.get_zc_byids(ret.value.ids);
        }
    });
    api.addEventListener({
        name: 'do_getids_complete'
    }, function(ret) {
        if (!app.canedit) {
            return;
        }
        if (ret.value && ret.value.id) {
            var retids = '[' + ret.value.id + ']'
            app.get_zc_byids(retids);
        }
        setTimeout(function() {
            api.sendEvent({
                name: 'do_close_scan',
                extra: {
                    isclose: true
                }
            });
        }, 500);
    });
    api.addEventListener({
        name: 'do_start_remove_weixiu'
    }, function(ret) {
        app.do_remove();
    });
    api.addEventListener({
        name: 'do_start_complete_weixiu'
    }, function(ret) {
        if (ret.value.status >= 0) {
            app.do_complete(ret.value.status);
        }
    });
    api.addEventListener({
        name: 'do_start_edit_weixiu'
    }, function(ret) {
        app.do_edit();
    });
    api.addEventListener({
        name: 'do_reload_weixiu_form'
    }, function(ret, err) {
        if (app.canedit) {
            return;
        }
        app.get_data();
    });

}
