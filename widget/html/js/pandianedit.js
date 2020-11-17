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
            UserRealName: '管理员',
            FromDateDesc: '2019-04-25',
            Content: '',
            LocationTitle: '123',
            TaskStatus: 0,
            TabStatus: 0,
            TabIndex: 0,
            totalcount: 0,
            keywords: '',
            pageindex: 1,
            pagesize: 10,
            current_item_length: 0,
            is_searching: false,
            scroll_top: 0,
            can_scroll: false,
            StartTime: '',
            EndTime: ''
        },
        zclist: [],
        source: 'pandianedit',
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
            show: false
        }, {
            status: 20,
            type: 3,
            title: '盘盈',
            count: 0,
            show: false
        }, {
            status: 30,
            type: 4,
            title: '盘亏',
            count: 0,
            show: false
        }],
        cangetcount: 1
    },
    methods: {
        do_select_tab: function(item) {
            var that = this;
            that.tabtype = item.type;
            that.form.TabStatus = item.status;
            that.get_data();
        },
        getTabStatus: function() {
            var that = this;
            if (that.form.TabIndex <= 0) {
                return;
            }
            var item = that.tablist[that.form.TabIndex - 1];
            that.tabtype = item.type;
            that.form.TabStatus = item.status;
            if (that.canedit) {
                that.tabtype = 2;
                that.form.TabStatus = 0;
            }
        },
        get_data: function() {
            var that = this;
            for (var i = 0; i < that.tablist.length; i++) {
                that.tablist[i].show = true;
            }
            if (that.canedit) {
                that.tablist[2].show = false;
                that.tablist[3].show = false;
            } else if (that.form.TaskStatus == 0) {
                that.tablist[0].show = false;
            } else if (that.form.TaskStatus == 10) {
                that.tablist[3].show = false;
            }

            var options = {
                action: 'APP_GETPANDIANLOCATIONMODELWITHZCLIST',
                taskid: that.form.TaskID,
                status: that.form.TabStatus,
                buildingid: that.form.BuildingID,
                floorid: that.form.FloorID,
                locationid: that.form.LocationID,
                cangetcount: that.cangetcount,
                fromdate: that.form.StartTime,
                todate: that.form.EndTime,
                typeids: '',
                p: that.form.pageindex,
                pagecount: that.form.pagesize,
                searchstr: that.form.keywords,
            };
            that.form.can_scroll = false;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    // that.form = data.data;
                    if (that.form.pageindex == 1) {
                        that.zclist = data.list;
                    } else {
                        that.zclist = that.zclist.concat(data.list);
                    }
                    that.form.totalcount = data.total;
                    if (that.zclist.length < that.form.totalcount) {
                        that.form.can_scroll = true;
                    }
                    if (that.cangetcount == 1 && data.countmodel) {
                        that.tablist[0].count = data.countmodel.nopdcount;
                        that.tablist[1].count = data.countmodel.pdcount;
                        that.tablist[2].count = data.countmodel.pycount;
                        that.tablist[3].count = data.countmodel.pkcount;
                    }
                    if (data.LocationTitle) {
                        that.form.LocationTitle = data.LocationTitle;
                    }
                } else if (err) {
                    ns.toast(err);
                }
                that.cangetcount = 0;
            }, {
                toast: true
            });
        },
        pull_refresh_init: function() {
            var that = this;
            var pullRefresh = new auiPullToRefresh({
                container: document.querySelector('.aui-refresh-content'),
                triggerDistance: 100
            }, function(ret) {
                if (ret.status == "success") {
                    setTimeout(function() {
                        that.form.pageindex = 1;
                        app.form.keywords = '';
                        that.get_data();
                        pullRefresh.cancelLoading(); //刷新成功后调用此方法隐藏
                    }, 1500)
                }
            })
            var scroll = new auiScroll({
                listen: true,
                distance: 0 //判断到达底部的距离，isToBottom为true
            }, function(ret) {
                if (ret.isToBottom && that.form.can_scroll) {
                    if (that.form.scroll_top > ret.scrollTop) {
                        that.form.scroll_top = ret.scrollTop;
                        return;
                    }
                    that.form.scroll_top = ret.scrollTop + 1;
                    that.form.pageindex++;
                    that.get_data();
                }
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
                status: -1,
                exceptids: JSON.stringify(that.get_exists_zcids()),
                ispandian: 1,
                LocationID: that.form.LocationID
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.zclist = that.zclist.concat(data.list);
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
        do_remove_zc: function(item) {
            var that = this;
            ns.confirm({
                msg: '确认删除?'
            }, function() {
                var newlist = [];
                for (var i = 0; i < that.zclist.length; i++) {
                    if (item.ID != that.zclist[i].ID) {
                        newlist.push(item);
                    }
                }
                that.zclist = newlist;
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
    app.getTabStatus();
    app.pull_refresh_init();
    setTimeout(function() {
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_complete_pandianzc'
    }, function(ret) {
        if (ret.value && ret.value.id) {
            app.do_complete_pandian_zc(ret.value.id, '');
        }
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
}
