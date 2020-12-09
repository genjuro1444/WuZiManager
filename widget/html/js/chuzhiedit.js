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
        source: 'chuzhiedit',
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
            if (that.form.FromDateDesc == '' || that.form.FromDateDesc == null) {
                ns.toast('申请日期不能为空');
                return;
            }
            if (that.zclist.length == 0) {
                ns.toast('处置资产不能为空');
                return;
            }
            that.form.OrderStatus = 10;
            that.form.OrderTypeID = 100;
            that.form.FromDate = that.form.FromDateDesc;
            that.form['Items'] = that.zclist;
            var options = {
                action: 'APP_BATCHORDER_CZ',
                data: JSON.stringify(that.form)
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    ns.toast('处置单保存成功');
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
                name: 'do_reload_chuzhi_form'
            });
            api.sendEvent({
                name: 'do_reload_chuzhi_list'
            });
            api.sendEvent({
                name: 'do_reload_zc_list'
            });
        },
        do_select_date: function() {
            var that = this;
            api.openPicker({
                type: 'date',
                date: that.form.FromDateDesc,
                title: '选择日期'
            }, function(ret, err) {
                if (ret) {
                    var year = ret.year;
                    var month = (ret.month >= 10 ? ret.month : '0' + ret.month);
                    var day = (ret.day >= 10 ? ret.day : '0' + ret.day);
                    that.form.FromDateDesc = year + '-' + month + '-' + day;
                }
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
                status: 99,
                repairstatus: 0,
                exceptids: exceptids,
                disablechoosestatus: true,
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
            var name = 'chuzhieditbtn_frm';
            var url = 'chuzhieditbtn_frm.html';
            ns.openFrame(name, url, {
                type: 'push'
            }, {
                status: that.form.OrderStatus,
                id: that.form.ID
            });
        },
        do_remove: function() {
            var that = this;
            ns.confirm({
                msg: '确认删除?'
            }, function() {
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
                msg: '确认' + (_status == 10 ? '取消' : '') + '完成该处置单?'
            }, function() {
                var options = {
                    action: 'APP_COMPLETECZ',
                    ID: that.form.ID,
                    Status: _status
                }
                ns.post(options, function(succeed, data, err) {
                    if (succeed) {
                        ns.toast(((_status == 10 ? '取消' : '')) + '完成成功');
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
            var title = '修改处置单';
            var name = 'chuzhiedit_frm_new';
            var cansave = true;
            var canedit = true;
            var hideeditbtn = true;
            ns.openWin(name, title, {
                canedit: canedit,
                cansavechuzhi: cansave,
                id: that.form.ID,
                hideeditbtn: hideeditbtn,
                url: 'chuzhiedit_frm.html'
            });
        },
        do_select_type: function() {
            var that = this;
            var title = '选择处置方式';
            var name = 'choosechuzhitype_frm';
            ns.openWin(name, title);
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
        name: 'do_save_chuzhi'
    }, function() {
        if (!app.canedit) {
            return;
        }
        app.do_save();
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
        name: 'do_getids_complete'
    }, function(ret) {
        if (!app.canedit) {
            return;
        }
        if (ret.value && ret.value.id) {
            var retids = '[' + ret.value.id + ']'
            app.get_zc_byids(retids);
        }
    });
    api.addEventListener({
        name: 'do_start_remove_chuzhi'
    }, function(ret) {
        app.do_remove();
    });
    api.addEventListener({
        name: 'do_start_complete_chuzhi'
    }, function(ret) {
        if (ret.value.status >= 0) {
            app.do_complete(ret.value.status);
        }
    });
    api.addEventListener({
        name: 'do_start_edit_chuzhi'
    }, function(ret) {
        app.do_edit();
    });
    api.addEventListener({
        name: 'do_choose_chuzhitype_complete'
    }, function(ret) {
        if (!app.canedit) {
            return;
        }
        if (ret.value) {
            app.form.ChuZhiTypeID = ret.value.id;
            app.form.ChuZhiTypeDesc = ret.value.name;
        }
    });
    api.addEventListener({
        name: 'do_reload_chuzhi_form'
    }, function(ret, err) {
        if (app.canedit) {
            return;
        }
        app.get_data();
    });
}
