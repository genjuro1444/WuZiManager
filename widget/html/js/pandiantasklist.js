var ns;
var app = new Vue({
    el: '#app',
    data: {
        hideeditbtn: false,
        list: [],
        form: {
            totalcount: 0,
            keywords: '',
            pageindex: 1,
            pagesize: 10,
            current_item_length: 0,
            is_searching: false,
            scroll_top: 0,
            can_scroll: false,
            source: 'pandiantasklist',
            branchcode: '',
            showtype: 0
        },
        searchform: {
            StartTime: '',
            EndTime: '',
            TypeIDs: '',
            TypeTitles: '',
            CompleteStatus: 0
        },
        tablist: [{
            type: 0,
            title: '我盘点的',
        }, {
            type: 1,
            title: '我管理的',
        }],
    },
    methods: {
        do_select_tab: function(item) {
            var that = this;
            that.form.showtype = item.type;
            that.get_data();
        },
        get_data: function() {
            var that = this;
            that.form.can_scroll = false;
            ns.post({
                action: 'APP_GETPANCHECKTASK_PAGE',
                p: that.form.pageindex,
                pagecount: that.form.pagesize,
                searchstr: that.form.keywords,
                fromdate: that.searchform.StartTime,
                todate: that.searchform.EndTime,
                typeids: that.searchform.TypeIDs,
                showtype: that.form.showtype,
                completed: that.searchform.CompleteStatus
            }, function(succeed, data, err) {
                if (succeed) {
                    if (that.form.pageindex == 1) {
                        that.list = data.list;
                    } else {
                        that.list = that.list.concat(data.list);
                    }
                    that.form.totalcount = data.total;
                    if (that.list.length < that.form.totalcount) {
                        that.form.can_scroll = true;
                    }
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_add_task: function(id, status, pdname) {
            var that = this;
            ns.post({
                action: 'APP_CHECKZCEPCODESTATUS',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.do_open_add_task(id, status, pdname);
                } else if (err) {
                    ns.confirm({
                        msg: err,
                        buttons: ['开始录入', '继续盘点']
                    }, function() {
                        var name = 'zcgl_frm';
                        var title = '资产管理';
                        ns.openWin(name, title, {
                            title: title,
                            cansearchzc: true,
                            IsHasEPCode: 2
                        });
                    }, function() {
                        that.do_open_add_task(id, status, pdname);
                    })
                }
            }, {
                toast: true
            });
        },
        do_open_add_task: function(id, status, pdname) {
            var that = this;
            var title = id > 0 ? (pdname) : '新增盘点单';
            var name = 'pandiantaskedit_frm';
            var cansave = id > 0 ? false : true;
            var canedit = id > 0 ? false : true;
            var canscanpdlocation = false;
            if (status == 10) {
                canscanpdlocation = true;
            }
            ns.openWin(name, title, {
                canedit: canedit,
                cansavepandiantask: cansave,
                canscanpdlocation: canscanpdlocation,
                id: id
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
        do_search: function() {
            var that = this;
            var name = 'pandiansearchbar_frm';
            var url = 'pandiansearchbar_frm.html';
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
                source: that.form.source,
                StartTime: that.searchform.StartTime,
                EndTime: that.searchform.EndTime,
                TypeIDs: that.searchform.TypeIDs,
                TypeTitles: that.searchform.TypeTitles,
                CompleteStatus: that.searchform.CompleteStatus
            });
        },
        do_search_keywords: function() {
            var that = this;
            var title = '搜索';
            var name = 'zcsearch_frm';
            ns.openWin(name, title, {
                source: that.form.source
            });
        },
        do_open_list: function(item, tabindex) {
            var that = this;
            var title = item.Title + ' - 盘点情况';
            var name = 'pandianedit_frm';
            ns.openWin(name, title, {
                TaskID: item.ID,
                cansavepandian: false,
                canedit: false,
                TaskStatus: item.Status,
                tabindex: tabindex
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.keywords = ns.getPageParam('keywords') || '';
    app.hideeditbtn = ns.getPageParam('hideeditbtn') || false;
    app.pull_refresh_init();
    setTimeout(function() {
        app.form.pageindex = 1;
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'reloadpandiantasklist'
    }, function(ret) {
        app.get_data();
    });
    api.addEventListener({
        name: 'do_open_add_pandian'
    }, function() {
        app.do_add_task(0, 0);
    });
    api.addEventListener({
        name: 'do_search_complete'
    }, function(ret) {
        if (ret.value.source == app.form.source) {
            if (ret.value && ret.value.keywords) {
                app.form.keywords = ret.value.keywords;
                app.form.pageindex = 1;
                app.get_data();
            }
        }
    });
    api.addEventListener({
        name: 'do_pdtask_searchbar_complete'
    }, function(ret) {
        if (ret.value.source == app.form.source) {
            if (ret.value) {
                app.searchform.StartTime = ret.value.StartTime;
                app.searchform.EndTime = ret.value.EndTime;
                app.searchform.TypeIDs = ret.value.TypeIDs;
                app.searchform.TypeTitles = ret.value.TypeTitles;
                app.searchform.CompleteStatus = ret.value.CompleteStatus;
            }
            app.form.pageindex = 1;
            app.get_data();
        }
    });
    api.addEventListener({
        name: 'do_open_searchpandian'
    }, function() {
        app.do_search_keywords();
    });
}
