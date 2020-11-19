var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            source: '',
            TypeName: '',
            TypeID: '',
            StatusDesc: '',
            Status: '',
            BranchCode: '',
            DeptName: '',
            UserGW: '',
            DepartmentID: 0,
            UserName: '',
            UserRealName: '',
            LocationID: '',
            LocTitle: '',
            RepairStatusDesc: '',
            RepairStatus: -1,
            IsPublic: 0,
            disablechoosestatus: false,
            disablechoosesrepairetatus: false,
            DisableBranch: false
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
                    TypeName: that.form.TypeName,
                    TypeID: that.form.TypeID,
                    StatusDesc: that.form.StatusDesc,
                    Status: that.form.Status,
                    RepairStatus: that.form.RepairStatus,
                    RepairStatusDesc: that.form.RepairStatusDesc,
                    DeptName: that.form.DeptName,
                    BranchCode: that.form.BranchCode,
                    UserGW: that.form.UserGW,
                    DepartmentID: that.form.DepartmentID,
                    UserRealName: that.form.UserRealName,
                    UserName: that.form.UserName,
                    LocTitle: that.form.LocTitle,
                    LocationID: that.form.LocationID,
                    IsPublic: that.form.IsPublic
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
            that.form.TypeName = '';
            that.form.TypeID = '';
            that.form.StatusDesc = '';
            that.form.Status = '';
            that.form.RepairStatus = -1;
            that.form.RepairStatusDesc = '';
            that.form.BranchCode = '';
            that.form.DeptName = '';
            that.form.UserGW = '';
            that.form.DepartmentID = 0;
            that.form.UserName = '';
            that.form.UserRealName = '';
            if (!that.form.DisableBranch) {
                that.form.LocationID = '';
                that.form.LocTitle = '';
            }
            that.form.IsPublic = 0;
        },
        do_select_status: function (status) {
            var that = this;
            if (that.form.disablechoosestatus) {
                return;
            }
            var title = '选择资产状态';
            var name = 'choosezcstatus_frm';
            ns.openWin(name, title);
        },
        do_select_repairstatus: function (status) {
            var that = this;
            if (that.form.disablechoosesrepairetatus) {
                return;
            }
            var title = '选择使用状态';
            var name = 'choosezcusestatus_frm';
            ns.openWin(name, title);
        },
        do_select_type: function () {
            var that = this;
            var title = '选择资产分类';
            var name = 'choosezctype_frm';
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
                ns.toast('请选择使用公司');
                return;
            }
            var title = '选择使用部门';
            var name = 'choosedepartment_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                source: that.source
            });
        },
        do_select_userstaff: function () {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择使用公司');
                return;
            }
            if (that.form.DepartmentID <= 0 || that.form.UserGW == '') {
                ns.toast('请选择使用部门');
                return;
            }
            var title = '选择使用人';
            var name = 'chooseuserstaff_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                userGW: that.form.DepartmentID,
                source: that.source
            });
        },
        do_select_location: function () {
            var that = this;
            var title = '选择存放地点';
            var name = 'chooselocation_frm';
            ns.openWin(name, title, {
                canchooselocation: true,
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
                    that.form.StatusDesc = "闲置";
                    break;
                case 15:
                    that.form.StatusDesc = "已领用";
                    break;
                case 20:
                    that.form.StatusDesc = "使用中";
                    break;
                case 30:
                    that.form.StatusDesc = "借用";
                    break;
                case 100:
                    that.form.StatusDesc = "待处置";
                    break;
                case 200:
                    that.form.StatusDesc = "已处置";
                    break;
            }
        },
        getRepairStatusDesc: function () {
            var that = this;
            if (that.form.RepairStatus < 0 || that.form.RepairStatus == null || that.form.RepairStatus == undefined) {
                that.form.RepairStatus = -1;
            }
            switch (that.form.RepairStatus) {
                case 0:
                    that.form.RepairStatusDesc = "正常";
                    break;
                case 10:
                    that.form.RepairStatusDesc = "维修中";
                    break;
            }
        }
    }
});
apiready = function () {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.source = ns.getPageParam('source') || '';
    app.form.TypeName = ns.getPageParam('TypeName') || '';
    app.form.TypeID = ns.getPageParam('TypeID') || '';
    app.form.Status = ns.getPageParam('Status') || '';
    app.form.RepairStatus = ns.getPageParam('RepairStatus');
    app.form.DeptName = ns.getPageParam('DeptName') || '';
    app.form.BranchCode = ns.getPageParam('BranchCode') || '';
    app.form.UserGW = ns.getPageParam('UserGW') || '';
    app.form.DepartmentID = ns.getPageParam('DepartmentID') || 0;
    app.form.UserRealName = ns.getPageParam('UserRealName') || '';
    app.form.UserName = ns.getPageParam('UserName') || '';
    app.form.LocTitle = ns.getPageParam('LocTitle') || '';
    app.form.LocationID = ns.getPageParam('LocationID') || '';
    app.form.IsPublic = ns.getPageParam('IsPublic') || 0;
    app.form.disablechoosestatus = ns.getPageParam('disablechoosestatus') || false;
    app.form.disablechoosesrepairetatus = ns.getPageParam('disablechoosesrepairetatus') || false;
    app.form.DisableBranch = ns.getPageParam('DisableBranch') || false;
    app.getStatusDesc();
    app.getRepairStatusDesc();

    if (app.form.BranchCode == '' && !app.form.DisableBranch) {
        app.form.BranchCode = ns.Get_Branch_Code();
    }
    if (app.form.DeptName == '' && !app.form.DisableBranch) {
        app.form.DeptName = ns.Get_Branch_Name();
    }
    app.showbg = true;
    api.addEventListener({
        name: 'do_choose_zc_complete'
    }, function (ret) {
        app.do_close();
    });
    api.addEventListener({
        name: 'do_choose_zctype_complete'
    }, function (ret) {
        if (ret.value) {
            app.form.TypeName = ret.value.name;
            app.form.TypeID = ret.value.id;
        }
    });
    api.addEventListener({
        name: 'do_choose_zcstatus_complete'
    }, function (ret) {
        if (ret.value) {
            app.form.StatusDesc = ret.value.name;
            app.form.Status = ret.value.id;
        }
    });
    api.addEventListener({
        name: 'do_choose_zcusestatus_complete'
    }, function (ret) {
        if (ret.value) {
            app.form.RepairStatusDesc = ret.value.name;
            app.form.RepairStatus = ret.value.id;
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
    api.addEventListener({
        name: 'do_choose_location_complete'
    }, function (ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.LocationID = ret.value.id;
                app.form.LocTitle = ret.value.name;
            }
        }
    });
}
