var ns;
var app = new Vue({
    el: '#app',
    data: {
        canedit: false,
        form: {
            TaskID: 0,
            BranchCode: 0,
            BuildingID: 0,
            FloorID: 0,
            LocationID: 0,
            Code: '',
            UserRealName: '',
            FromDateDesc: '',
            Content: '',
            LocationTitle: '',
            TaskStatus: 0,
            TabStatus: 0,
            TabIndex: 0,
            totalpdcount: 0,
            totalnopdcount: 0,
            keywords: '',
            pageindex: 1,
            pagesize: 999999,
            current_item_length: 0,
            is_searching: false,
            scroll_top: 0,
            can_scroll: false,
            StartTime: '',
            EndTime: ''
        },
        zclist: [],
        zcnopdlist: [],
        source: 'pandianstart',
        chosenids: '',
        status: 1,
        tabtype: 2,
        tablist: [{
            status: 10,
            NumberStatus: -1,
            type: 1,
            title: '未盘',
            count: 0,
            show: false
        }, {
            status: 0,
            type: 2,
            title: '已盘',
            count: 0,
            show: true
        }],
        cansave: false
    },
    methods: {
        do_select_tab: function(type, status) {
            var that = this;
            that.tabtype = type;
            that.form.TabStatus = status;
        },
        get_data: function() {
            var that = this;
            var options = {
                action: 'APP_GETPANDIANLOCATIONMODELWITHZCLIST',
                taskid: that.form.TaskID,
                status: that.form.TabStatus,
                buildingid: that.form.BuildingID,
                floorid: that.form.FloorID,
                locationid: that.form.LocationID,
                cangetcount: 0,
                fromdate: that.form.StartTime,
                todate: that.form.EndTime,
                typeids: '',
                p: that.form.pageindex,
                pagecount: that.form.pagesize,
                searchstr: that.form.keywords,
                getalltype: 1
            };
            that.form.can_scroll = false;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    // that.form = data.data;
                    that.zclist = data.list;
                    that.zcnopdlist = data.nopdlist;
                    that.form.totalpdcount = that.zclist.length;
                    that.form.totalnopdcount = that.zcnopdlist.length;
                    if (data.LocationTitle) {
                        that.form.LocationTitle = data.LocationTitle;
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
            //alert(JSON.stringify(that.zclist));
            var options = {
                action: 'APP_ADDPDLOCATIONZCLIST',
                P1: that.form.LocationID,
                P2: that.form.TaskID,
                items: JSON.stringify(that.zclist)
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    ns.toast('盘点完成');
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
        },
        reload_list: function() {
            api.sendEvent({
                name: 'reloadpandiantaskedit'
            });
            api.sendEvent({
                name: 'reloadpandiantasklist'
            });
        },
        do_open_scan: function() {
            var that = this;
            ns.openDirectWin('scanner_frm', '../html/scanner_frm.html', {
                pandianzc: true
            })
        },
        get_exists_zcids: function() {
            var that = this;
            var idlist = [];
            for (var i = 0; i < that.zclist.length; i++) {
                idlist.push(that.zclist[i].ID);
            }
            return idlist;
        },
        do_complete_pandian_zc: function(id, ids) {
            var that = this;
            ids = ids || '[]';
            var idlist = eval('(' + ids + ')');
            if (id) {
                idlist.push(id);
            }
            var options = {
                action: 'APP_GETZCLISTBYIDS',
                ids: JSON.stringify(idlist),
                status: '[]',
                exceptids: JSON.stringify(that.get_exists_zcids()),
                ispandian: 1,
                LocationID: that.form.LocationID
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {                    
                    that.zclist = that.zclist.concat(data.list);
                    that.reset_zcnopdlist(data.list, true, false);
                } else if (err) {
                    ns.toast(err);
                }
                setTimeout(function() {
                    that.do_open_scan();
                }, 500);
            }, {
                toast: true
            });
        },
        reset_zcnopdlist: function(list, isdelete, isadd) {
            var that = this;
            if (isadd) {
                that.zcnopdlist = that.zcnopdlist.concat(list);
            } else {
                for (var i = 0; i < list.length; i++) {
                    for (var j = 0; j < that.zcnopdlist.length; j++) {
                        if (that.zcnopdlist[j].ID == list[i].ID) {
                            that.zcnopdlist[j]['isdelete'] = isdelete;
                        }
                    }
                }
            }
            var total = 0;
            for (var j = 0; j < that.zcnopdlist.length; j++) {
                if (!that.zcnopdlist[j]['isdelete']) {
                    total++;
                }
            }
            that.form.totalpdcount = that.zclist.length;
            that.form.totalnopdcount = total;
            that.cansave = true;
        },
        do_remove_zc: function(item) {
            var that = this;
            ns.confirm({
                msg: '确认删除?'
            }, function() {
                var newlist = [];
                for (var i = 0; i < that.zclist.length; i++) {
                    if (item.ID != that.zclist[i].ID) {
                        newlist.push(that.zclist[i]);
                    }
                }
                that.zclist = newlist;
                var list = [];
                list.push(item);
                if (item.PDID <= 0) {
                    that.reset_zcnopdlist(list, false, false);
                } else if (item.PDID > 0 && item.NumberStatus == 0) {
                    that.reset_zcnopdlist(list, false, true);
                }else{
                  that.reset_zcnopdlist([], false, false);
                }
                that.cansave = true;
                ns.toast('删除成功');
            })
        },
        do_search: function() {
            var that = this;
            var name = 'zcpdsearchbar_frm';
            var url = 'zcpdsearchbar_frm.html';
            var x = 0;
            var y = ns.getPageParam('header_h') || 25;
            var w = api.winWidth;
            var h = api.winHeight - y;
            ns.openFrame(name, url, {
                type: 'movein',
                subType: 'from_right',
                x: x,
                y: y,
                h: h,
                w: w
            }, {
                source: that.source,
                StartTime: that.form.StartTime,
                EndTime: that.form.EndTime,
            });
        },
        do_search_keywords: function() {
            var that = this;
            var title = '搜索';
            var name = 'zcsearch_frm';
            ns.openWin(name, title, {
                source: that.source
            });
        },
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.TaskID = ns.getPageParam('TaskID') || 0;
    app.form.TaskStatus = ns.getPageParam('TaskStatus') || 0;
    app.form.BranchCode = ns.getPageParam('BranchCode') || 0;
    app.form.BuildingID = ns.getPageParam('BuildingID') || 0;
    app.form.FloorID = ns.getPageParam('FloorID') || 0;
    app.form.LocationID = ns.getPageParam('LocationID') || 0;
    app.canedit = ns.getPageParam('canedit') || false;
    app.form.TabIndex = ns.getPageParam('tabindex') || 0;
    app.form.LocationTitle = ns.getPageParam('LocationTitle') || '';
    app.get_data();
    api.addEventListener({
        name: 'do_complete_pandianzc'
    }, function(ret) {
        if (ret.value && ret.value.id) {
            app.do_complete_pandian_zc(ret.value.id, '');
        }
    });
    api.addEventListener({
        name: 'do_save_pandian'
    }, function(ret) {
        app.do_save();
    });
    api.addEventListener({
        name: 'do_choose_zc_complete'
    }, function(ret) {
        if (ret.value && ret.value.ids) {
            app.do_complete_pandian_zc(0, ret.value.ids);
        }
    });
    api.addEventListener({
        name: 'do_search_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value && ret.value.keywords) {
                app.form.keywords = ret.value.keywords;
                app.form.pageindex = 1;
                app.get_data();
            }
        }
    });
    api.addEventListener({
        name: 'do_zcpdsearchbar_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.StartTime = ret.value.StartTime;
                app.form.EndTime = ret.value.EndTime;
            }
            app.form.pageindex = 1;
            app.get_data();
        }
    });
    api.addEventListener({
        name: 'closepandianstartwin'
    }, function(ret, err) {
        if (app.cansave) {
            api.confirm({
                title: '提示',
                msg: '当前盘点未保存，确认放弃本次盘点？',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret) {
                    if (ret.buttonIndex == 1) {
                        api.closeWin({
                            name: 'pandianstart_win'
                        });
                    }
                }
            });
            return;
        }
        api.closeWin({
            name: 'pandianstart_win'
        });
    });
}
