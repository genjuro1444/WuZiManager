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
            source: 'zcgl',
        },
        searchform: {
            TypeName: '',
            TypeID: '',
            StatusDesc: '',
            Status: '',
            DeptName: '',
            BranchCode: '',
            UserGW: '',
            DepartmentID: 0,
            UserRealName: '',
            UserName: '',
            LocTitle: '',
            LocationID: '',
            RepairStatus: -1,
            RepairStatusDesc: '',
            IsPublic: 0,
            IsHasEPCode: 0
        },
        hideeditbtn: false,
        addmore: false,
    },
    methods: {
        get_data: function() {
            var that = this;
            if (!ns.AllowAuth('ZCGLADD') || !ns.AllowAuth('ZCGLORDER')) {
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
                action: 'APP_GETZCLIST',
                p: that.form.pageindex,
                pagecount: that.form.pagesize,
                searchstr: that.form.keywords,
                typeid: that.searchform.TypeID,
                status: that.searchform.Status,
                branchcode: that.searchform.BranchCode,
                usergw: that.searchform.DepartmentID,
                uname: that.searchform.UserName,
                locationid: that.searchform.LocationID,
                repairstatus: that.searchform.RepairStatus,
                shared: shared,
                IsHasEPCode: that.searchform.IsHasEPCode
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
            if (id > 0) {
                that.addmore = false;
            }
            var that = this;
            var name = 'zcedit_frm';
            var title = id > 0 ? '资产详情' : '选择申请单';
            var hideeditbtn = id > 0 ? false : true;
            if (that.hideeditbtn) {
                hideeditbtn = true;
            }
            var canruku = false;
            if (id <= 0) {
                name = 'zcsqgl_frm';
                canruku = true;
                hideeditbtn = true;
            }
            var cansave = id > 0 ? false : true;
            var canedit = id > 0 ? false : true;

            ns.openWin(name, title, {
                canedit: canedit,
                cansave: cansave,
                id: id,
                hideeditbtn: hideeditbtn,
                addmore: that.addmore,
                canruku: canruku
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
                RepairStatusDesc: that.searchform.RepairStatusDesc,
                RepairStatus: that.searchform.RepairStatus,
                DeptName: that.searchform.DeptName,
                BranchCode: that.searchform.BranchCode,
                UserGW: that.searchform.UserGW,
                DepartmentID: that.searchform.DepartmentID,
                UserRealName: that.searchform.UserRealName,
                UserName: that.searchform.UserName,
                LocTitle: that.searchform.LocTitle,
                LocationID: that.searchform.LocationID,
                IsPublic: that.searchform.IsPublic,
                IsHasEPCode: that.searchform.IsHasEPCode
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
                distance: 5 //判断到达底部的距离，isToBottom为true
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
        do_open_operation: function() {
            var that = this;
            var name = 'zcglbtn_frm';
            var url = 'zcglbtn_frm.html';
            ns.openFrame(name, url, {
                type: 'push'
            });
        },
        open_lingyong: function() {
            var that = this;
            var title = '资产领用';
            var name = 'zclingyong_frm';
            var cansave = true;
            var canedit = true;
            var hideeditbtn = true;
            ns.openWin(name, title, {
                canedit: canedit,
                canlingyong: cansave,
                hideeditbtn: hideeditbtn
            });
        },
        open_fenpei: function() {
            var that = this;
            var title = '资产分配';
            var name = 'zcfenpei_frm';
            var cansave = true;
            var canedit = true;
            var hideeditbtn = true;
            ns.openWin(name, title, {
                canedit: canedit,
                canfenpei: cansave,
                hideeditbtn: hideeditbtn
            });
        },
        open_tuiku: function() {
            var that = this;
            var title = '资产退库';
            var name = 'zctuiku_frm';
            var cansave = true;
            var canedit = true;
            var hideeditbtn = true;
            ns.openWin(name, title, {
                canedit: canedit,
                cantuiku: cansave,
                hideeditbtn: hideeditbtn
            });
        },
        open_borrow: function() {
            var that = this;
            var title = '资产借用';
            var name = 'zcborrow_frm';
            var cansave = true;
            var canedit = true;
            var hideeditbtn = true;
            ns.openWin(name, title, {
                canedit: canedit,
                canborrow: cansave,
                hideeditbtn: hideeditbtn
            });
        },
        open_borrowback: function() {
            var that = this;
            var title = '资产归还';
            var name = 'zcborrowback_frm';
            var cansave = true;
            var canedit = true;
            var hideeditbtn = true;
            ns.openWin(name, title, {
                canedit: canedit,
                canborrowback: cansave,
                hideeditbtn: hideeditbtn
            });
        },
        open_change: function() {
            var that = this;
            var title = '变更使用人';
            var name = 'zcchangelingyong_frm';
            var cansave = true;
            var canedit = true;
            var hideeditbtn = true;
            ns.openWin(name, title, {
                canedit: canedit,
                canlingyong: cansave,
                hideeditbtn: hideeditbtn
            });
        },
        open_changelingyong: function() {
            var that = this;
            var title = '变更领用人';
            var name = 'zcchangelingyong_frm';
            ns.openWin(name, title, {
                canedit: true,
                canchangelingyong: true,
                hideeditbtn: true
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
                    return "receive";
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
                case 15:
                    that.searchform.StatusDesc = "已领用";
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
        },
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.keywords = ns.getPageParam('keywords') || '';
    app.searchform.Status = ns.getPageParam('status') || 0;
    app.searchform.LocationID = ns.getPageParam('LocationID') || '';
    app.searchform.IsHasEPCode = ns.getPageParam('IsHasEPCode') || 0;
    app.getStatusDesc();
    app.hideeditbtn = ns.getPageParam('hideeditbtn') || false;
    app.pull_refresh_init();
    setTimeout(function() {
        app.form.pageindex = 1;
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_open_add'
    }, function(ret) {
        app.addmore = false;
        if (ret.value && ret.value.addmore) {
            app.addmore = true;
        }
        app.do_add_zc(0);
    });
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
                app.searchform.DepartmentID = ret.value.DepartmentID;
                app.searchform.UserRealName = ret.value.UserRealName;
                app.searchform.UserName = ret.value.UserName;
                app.searchform.LocTitle = ret.value.LocTitle;
                app.searchform.LocationID = ret.value.LocationID;
                app.searchform.IsPublic = ret.value.IsPublic;
                app.searchform.IsHasEPCode = ret.value.IsHasEPCode;
            }
            app.form.pageindex = 1;
            app.get_data();
        }
    });
    api.addEventListener({
        name: 'do_start_lingyong'
    }, function(ret) {
        app.open_lingyong();
    });
    api.addEventListener({
        name: 'do_start_fenpei'
    }, function(ret) {
        app.open_fenpei();
    });
    api.addEventListener({
        name: 'do_start_tuiku'
    }, function(ret) {
        app.open_tuiku();
    });
    api.addEventListener({
        name: 'do_start_borrow'
    }, function(ret) {
        app.open_borrow();
    });
    api.addEventListener({
        name: 'do_start_borrowback'
    }, function(ret) {
        app.open_borrowback();
    });
    api.addEventListener({
        name: 'do_start_changelingyong'
    }, function(ret) {
        app.open_changelingyong();
    });
    api.addEventListener({
        name: 'do_reload_zc_list'
    }, function(ret) {
        app.get_data();
    });
    api.addEventListener({
        name: 'do_start_change'
    }, function(ret) {
        app.open_change();
    });
}
