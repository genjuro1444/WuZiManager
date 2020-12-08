var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            source: '',
            StatusDesc: '',
            Status: '',
            BranchCode: '',
            DeptName: '',
            UserGW: '',
            DepartmentID: 0,
            UserName: '',
            UserRealName: '',
            IsPublic: 0,
            IsHasEPCode: 0
        },
        list: [],
        showbg: false,
        source: 'zcsearchbar'
    },
    methods: {
        do_search: function () {
            var that = this;
            api.sendEvent({
                name: 'do_searchbar_complete',
                extra: {
                    source: that.form.source,
                    StatusDesc: that.form.StatusDesc,
                    Status: that.form.Status,
                    DeptName: that.form.DeptName,
                    BranchCode: that.form.BranchCode,
                    UserGW: that.form.UserGW,
                    DepartmentID: that.form.DepartmentID,
                    UserRealName: that.form.UserRealName,
                    UserName: that.form.UserName,
                    IsPublic: that.form.IsPublic,
                    IsHasEPCode: that.form.IsHasEPCode
                }
            });
            setTimeout(function () {
                that.do_close();
            }, 100)
        },
        do_close: function () {
            var that = this;
            that.showbg = false;
            api.closeFrame();
        },
        do_reset: function () {
            var that = this;
            that.form.StatusDesc = '';
            that.form.Status = '';
            that.form.BranchCode = '';
            that.form.DeptName = '';
            that.form.UserGW = '';
            that.form.DepartmentID = 0;
            that.form.UserName = '';
            that.form.UserRealName = '';
            that.form.IsPublic = 0;
            that.form.IsHasEPCode = 0;
        },
        do_select_status: function (status) {
            var that = this;
            var title = '选择申请状态';
            var name = 'choosezcsqstatus_frm';
            ns.openWin(name, title);
        },
        do_select_company: function () {
            var that = this;
            var title = '选择使用公司';
            var name = 'choosecompany_frm';
            ns.openWin(name, title, {
                source: that.source,
                BranchCode: that.form.BranchCode
            });
        },
        do_select_department: function () {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择申请公司');
                return;
            }
            var title = '选择申请部门';
            var name = 'choosedepartment_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                source: that.source
            });
        },
        do_select_userstaff: function () {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择申请公司');
                return;
            }
            if (that.form.DepartmentID <= 0 || that.form.UserGW == '') {
                ns.toast('请选择申请部门');
                return;
            }
            var title = '选择申请人';
            var name = 'chooseuserstaff_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                userGW: that.form.DepartmentID,
                source: that.source
            });
        },
        do_select_public: function (status) {
            var that = this;
            that.form.IsPublic = status;
        },
        getStatusDesc: function () {
            var that = this;
            switch (that.form.Status) {
                case 10:
                    that.form.StatusDesc = "申请中";
                    break;
                case 15:
                    that.form.StatusDesc = "部分入库";
                    break;
                case 20:
                    that.form.StatusDesc = "已入库";
                    break;
                case 30:
                    that.form.StatusDesc = "已作废";
                    break;
            }
        }
    }
});
apiready = function () {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.source = ns.getPageParam('source') || '';
    app.form.Status = ns.getPageParam('Status') || '';
    app.form.DeptName = ns.getPageParam('DeptName') || '';
    app.form.BranchCode = ns.getPageParam('BranchCode') || '';
    app.form.UserGW = ns.getPageParam('UserGW') || '';
    app.form.DepartmentID = ns.getPageParam('DepartmentID') || 0;
    app.form.UserRealName = ns.getPageParam('UserRealName') || '';
    app.form.UserName = ns.getPageParam('UserName') || '';
    app.form.IsPublic = ns.getPageParam('IsPublic') || 0;
    app.form.IsHasEPCode = ns.getPageParam('IsHasEPCode') || 0;
    app.getStatusDesc();
    if (app.form.BranchCode == '') {
        app.form.BranchCode = ns.Get_Branch_Code();
    }
    if (app.form.DeptName == '') {
        app.form.DeptName = ns.Get_Branch_Name();
    }
    app.showbg = true;
    api.addEventListener({
        name: 'do_choose_zcsqstatus_complete'
    }, function (ret) {
        if (ret.value) {
            app.form.StatusDesc = ret.value.name;
            app.form.Status = ret.value.id;
        }
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
                if (app.form.DepartmentID != ret.value.id || app.form.UserGW != ret.value.name) {
                    app.form.DepartmentID = ret.value.id;
                    app.form.UserGW = ret.value.name;
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
}
