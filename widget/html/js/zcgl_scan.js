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
            source: 'zcgl_scan'
        },
        searchform: {
            TypeName: '',
            TypeID: '',
            StatusDesc: '',
            Status: '',
            DeptName: '',
            BranchCode: '',
            UserGW: '',
            UserRealName: '',
            UserName: '',
            LocTitle: '',
            LocationID: '',
            RepairStatus: -1,
            RepairStatusDesc: '',
            IsPublic: 0
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            that.form.can_scroll = false;
            var shared = '';
            if (that.searchform.IsPublic == 1) {
                shared = 0;
            } else if (that.searchform.IsPublic == 2) {
                shared = 1;
            }
            ns.post({
                action: 'APP_GETZCLIST',
                p: that.form.pageindex,
                pagecount: that.form.pagesize,
                searchstr: that.form.keywords,
                typeid: that.searchform.TypeID,
                status: that.searchform.Status,
                branchcode: that.searchform.BranchCode,
                usergw: that.searchform.UserGW,
                uname: that.searchform.UserName,
                locationid: that.searchform.LocationID,
                repairstatus: that.searchform.RepairStatus,
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
                    that.searchform.LocTitle = data.searchform.LocTitle;
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_add_zc: function(id) {
            var that = this;
            var that = this;
            var title = '资产详情';
            var name = 'zcedit_frm';
            ns.openWin(name, title, {
                canedit: false,
                cansave: false,
                id: id,
                hideeditbtn: true,
                addmore: false
            });
        },
        do_search: function() {
            var that = this;
            var name = 'zcsearchbar_frm';
            var url = 'zcsearchbar_frm.html';
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
                TypeName: that.searchform.TypeName,
                TypeID: that.searchform.TypeID,
                StatusDesc: that.searchform.StatusDesc,
                Status: that.searchform.Status,
                DeptName: that.searchform.DeptName,
                BranchCode: that.searchform.BranchCode,
                UserGW: that.searchform.UserGW,
                UserRealName: that.searchform.UserRealName,
                UserName: that.searchform.UserName,
                LocTitle: that.searchform.LocTitle,
                LocationID: that.searchform.LocationID,
                IsPublic: that.searchform.IsPublic,
                DisableBranch: true
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
                case 20:
                    return "using";
                    break;
                case 30:
                    return "lend";
                    break;
                case 100:
                    return "pendispose";
                    break;
                case 200:
                    return "dispose";
                    break;
            }
            return "dispose";
        },
        getStatusDesc: function() {
            var that = this;
            switch (that.searchform.Status) {
                case 10:
                    that.searchform.StatusDesc = "闲置";
                    break;
                case 20:
                    that.searchform.StatusDesc = "使用中";
                    break;
                case 30:
                    that.searchform.StatusDesc = "借用";
                    break;
                case 100:
                    that.searchform.StatusDesc = "待处置";
                    break;
                case 200:
                    that.searchform.StatusDesc = "已处置";
                    break;
            }
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.keywords = ns.getPageParam('keywords') || '';
    app.searchform.Status = ns.getPageParam('status') || 0;
    app.searchform.LocationID = ns.getPageParam('LocationID') || '';
    app.getStatusDesc();
    app.pull_refresh_init();
    setTimeout(function() {
        app.form.pageindex = 1;
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_open_searchzc'
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
                app.searchform.TypeID = ret.value.TypeID;
                app.searchform.TypeName = ret.value.TypeName;
                app.searchform.StatusDesc = ret.value.StatusDesc;
                app.searchform.Status = ret.value.Status;
                app.searchform.RepairStatus = ret.value.RepairStatus;
                app.searchform.RepairStatusDesc = ret.value.RepairStatusDesc;
                app.searchform.DeptName = ret.value.DeptName;
                app.searchform.BranchCode = ret.value.BranchCode;
                app.searchform.UserGW = ret.value.UserGW;
                app.searchform.UserRealName = ret.value.UserRealName;
                app.searchform.UserName = ret.value.UserName;
                app.searchform.LocTitle = ret.value.LocTitle;
                app.searchform.LocationID = ret.value.LocationID;
                app.searchform.IsPublic = ret.value.IsPublic;
            }
            app.form.pageindex = 1;
            app.get_data();
        }
    });
    api.addEventListener({
        name: 'do_reload_zc_list'
    }, function(ret) {
        app.get_data();
    });
}
