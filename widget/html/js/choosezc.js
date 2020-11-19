var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            totalcount: 0,
            keywords: '',
            pageindex: 1,
            pagesize: 10,
            current_item_length: 0,
            is_searching: false,
            scroll_top: 0,
            can_scroll: false,
            source: 'choosezc',
            exceptids: '',
            disablechoosestatus: false,
            disablechoosesrepairetatus: false
        },
        searchform: {
            TypeName: '',
            TypeID: '',
            Status: '',
            DeptName: '',
            BranchCode: '',
            UserGW: '',
            UserRealName: '',
            UserName: '',
            LocTitle: '',
            LocationID: '',
            RepairStatus: -1,
            IsPublic: 0
        },
        list: [],
    },
    methods: {
        get_data: function() {
            var that = this;
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
                status: that.searchform.Status,
                except: that.form.exceptids,
                typeid: that.searchform.TypeID,
                branchcode: that.searchform.BranchCode,
                usergw: that.searchform.UserGW,
                username: that.searchform.UserName,
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
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
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
                Status: that.searchform.Status,
                RepairStatus: that.searchform.RepairStatus,
                DeptName: that.searchform.DeptName,
                BranchCode: that.searchform.BranchCode,
                UserGW: that.searchform.UserGW,
                DepartmentName: that.searchform.DepartmentName,
                UserRealName: that.searchform.UserRealName,
                UserName: that.searchform.UserName,
                LocTitle: that.searchform.LocTitle,
                LocationID: that.searchform.LocationID,
                IsPublic: that.searchform.IsPublic,
                disablechoosestatus: that.form.disablechoosestatus,
                disablechoosesrepairetatus: that.form.disablechoosesrepairetatus
            });
        },
        do_select_zcitem: function(item) {
            var that = this;
            item.ischecked = !item.ischecked;
        },
        do_save: function() {
            var that = this;
            var idlist = [];
            for (var i = 0; i < that.list.length; i++) {
                var item = that.list[i];
                if (item.ischecked) {
                    idlist.push(item.ID);
                }
            }
            if (idlist.length == 0) {
                ns.toast('请选择资产');
                return;
            }
            api.sendEvent({
                name: 'do_choose_zc_complete',
                extra: {
                    ids: JSON.stringify(idlist)
                }
            });
            setTimeout(function() {
                api.closeWin();
            }, 500);
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
        convertcss: function (status) {
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
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.keywords = ns.getPageParam('keywords') || '';
    app.searchform.Status = ns.getPageParam('status') || 0;
    app.searchform.RepairStatus = api.pageParam.repairstatus;
    if (app.searchform.RepairStatus < 0 || app.searchform.RepairStatus == null || app.searchform.RepairStatus == undefined) {
        app.searchform.RepairStatus = -1;
    }
    app.form.exceptids = ns.getPageParam('exceptids') || ''
    app.form.disablechoosestatus = ns.getPageParam('disablechoosestatus') || false;
    app.form.disablechoosesrepairetatus = ns.getPageParam('disablechoosesrepairetatus') || false;
    app.pull_refresh_init();
    setTimeout(function() {
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_save_choosezc'
    }, function() {
        app.do_save();
    });
    api.addEventListener({
        name: 'do_open_searchchoosezc'
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
                app.searchform.Status = ret.value.Status;
                app.searchform.RepairStatus = ret.value.RepairStatus;
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
}
