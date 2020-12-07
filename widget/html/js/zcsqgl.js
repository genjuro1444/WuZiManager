var ns;
var app = new Vue({
    el: '#app',
    data: {
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
            source: 'zcsqgl',
        },
        searchform: {
            DeptName: '',
            BranchCode: '',
            DepartmentID: 0,
            UserGW: '',
            UserRealName: '',
            UserName: '',
            StatusDesc: '',
            Status: '',
            IsPublic: 0
        },
        hideeditbtn: false,
        canruku: false
    },
    methods: {
        get_data: function() {
            var that = this;
            if (!ns.AllowAuth('ZCGLADD')) {
                that.hideeditbtn = true;
            }
            that.form.can_scroll = false;
            var shared = '';
            if (that.searchform.IsPublic == 1) {
                shared = 0;
            } else if (that.searchform.IsPublic == 2) {
                shared = 1;
            }
            ns.post({
                action: 'APP_GETZCSQLIST',
                p: that.form.pageindex,
                pagecount: that.form.pagesize,
                searchstr: that.form.keywords,
                status: that.searchform.Status,
                branchcode: that.searchform.BranchCode,
                usergw: that.searchform.DepartmentID,
                uname: that.searchform.UserName,
                shared: shared
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
        //新增申请单
        do_add_zcsq: function(id) {
            var that = this;
            var that = this;
            var title = id > 0 ? '申请单详情' : '新增申请单';
            var name = 'zcsqedit_frm';
            var cansave = id > 0 ? false : true;
            var canedit = id > 0 ? false : true;
            var hideeditbtn = id > 0 ? false : true;
            if (that.hideeditbtn) {
                hideeditbtn = true;
            }
            if (that.canruku) {
                title = '选择资产';
                hideeditbtn = true;
            }
            ns.openWin(name, title, {
                canedit: canedit,
                cansavezcsq: cansave,
                id: id,
                hideeditbtn: hideeditbtn,
                canruku: that.canruku
            });
        },
        do_search: function() {
            var that = this;
            var name = 'zcsqsearchbar_frm';
            var url = 'zcsqsearchbar_frm.html';
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
                StatusDesc: that.searchform.StatusDesc,
                Status: that.searchform.Status,
                DeptName: that.searchform.DeptName,
                BranchCode: that.searchform.BranchCode,
                UserGW: that.searchform.UserGW,
                DepartmentID: that.searchform.DepartmentID,
                UserRealName: that.searchform.UserRealName,
                UserName: that.searchform.UserName,
                IsPublic: that.searchform.IsPublic
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
        //打开操作界面
        do_open_operation: function() {
            var that = this;
            var name = 'zcsqglbtn_frm';
            var url = 'zcsqglbtn_frm.html';
            ns.openFrame(name, url, {
                type: 'push'
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
        convertcss: function(status) {
            switch (status) {
                case 10:
                    return "free";
                    break;
                case 15:
                case 20:
                    return "using";
                    break;
                case 30:
                    return "dispose";
                    break;
            }
            return "dispose";
        },
        do_close: function() {
            api.closeWin();
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.keywords = ns.getPageParam('keywords') || '';
    app.hideeditbtn = ns.getPageParam('hideeditbtn') || false;
    app.canruku = ns.getPageParam('canruku') || false;
    app.pull_refresh_init();
    setTimeout(function() {
        app.form.pageindex = 1;
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_close_zcsqgl'
    }, function() {
        app.do_close();
    });
    api.addEventListener({
        name: 'do_start_shenqing'
    }, function(ret) {
        app.do_add_zcsq();
    });
    api.addEventListener({
        name: 'do_open_searchzcsq'
    }, function() {
        app.do_search_keywords();
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
        name: 'do_searchbar_complete'
    }, function(ret) {
        if (ret.value.source == app.form.source) {
            if (ret.value) {
                app.searchform.StatusDesc = ret.value.StatusDesc;
                app.searchform.Status = ret.value.Status;
                app.searchform.DeptName = ret.value.DeptName;
                app.searchform.BranchCode = ret.value.BranchCode;
                app.searchform.UserGW = ret.value.UserGW;
                app.searchform.DepartmentID = ret.value.DepartmentID;
                app.searchform.UserRealName = ret.value.UserRealName;
                app.searchform.UserName = ret.value.UserName;
                app.searchform.IsPublic = ret.value.IsPublic;
            }
            app.form.pageindex = 1;
            app.get_data();
        }
    });
    api.addEventListener({
        name: 'do_start_change'
    }, function(ret) {
        app.open_change();
    });
    api.addEventListener({
        name: 'do_reload_zcsq_list'
    }, function(ret) {
        app.get_data();
    });
}
