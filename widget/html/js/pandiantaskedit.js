var ns;
var app = new Vue({
    el: '#app',
    data: {
        hideeditbtn: false,
        canedit: false,
        canpandian: false,
        tabtype: 1,
        form: {
            ID: 0,
            Code: '',
            TypeTitles: '',
            TypeIDs: '',
            BranchCode: '',
            BranchCodes: '',
            DeptNames: '',
            StartTime: '',
            StartTimeDesc: '',
            EndTime: '',
            EndTimeDesc: '',
            Content: ''
        },
        source: 'pandiantaskedit',
        locationform: {
            BranchCode: '',
            DeptName: '',
            TypeIDs: '',
            TypeTitles: '',
            BuildingID: 0,
            BuildingName: '',
            FloorID: 0,
            FloorName: '',
            LocationID: 0,
            LocTitle: '',
            source: '',
            FloorHeight: [],
        },
        buildinglist: [],
        floorlist: [],
    },
    methods: {
        do_select_tab: function(type) {
            this.tabtype = type;
        },
        get_data: function() {
            var that = this;
            if (that.canpandian) {
                this.tabtype = 2;
            }
            if (that.canedit) {
                this.tabtype = 1;
            } else {
                this.tabtype = 2;
            }
            ns.post({
                action: 'APP_GETCHECKTASKMODEL',
                id: that.form.ID
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.data;
                    that.locationform.TypeIDs = that.form.TypeIDs || '';
                    that.locationform.TypeTitles = that.form.TypeTitles;
                    that.locationform.BranchCode = that.form.BranchCode;
                    that.locationform.DeptName = that.form.DeptName;
                    if (!that.locationform.BranchCode) {
                        that.locationform.BranchCode = ns.Get_Branch_Code();
                        that.locationform.DeptName = ns.Get_Branch_Name();
                    }
                    if (that.form.ID > 0) {
                        that.get_building_data();
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
            if (that.form.FromDateDesc == '' || that.form.FromDateDesc == null) {
                ns.toast('计划开始日期不能为空');
                return;
            }
            that.form.FromDate = that.form.FromDateDesc;
            that.form.ToDate = that.form.ToDateDesc;
            var options = {
                action: 'APP_ADDCHECKTASK',
                data: JSON.stringify(that.form)
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    ns.toast('保存成功');
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
        do_select_date: function(type) {
            var that = this;
            var selectDate = that.form.FromDateDesc;
            if (type == 2) {
                selectDate = that.form.ToDateDesc;
            }
            api.openPicker({
                type: 'date',
                date: selectDate,
                title: '选择日期'
            }, function(ret, err) {
                if (ret) {
                    var year = ret.year;
                    var month = (ret.month >= 10 ? ret.month : '0' + ret.month);
                    var day = (ret.day >= 10 ? ret.day : '0' + ret.day);
                    selectDate = year + '-' + month + '-' + day;
                    if (type == 1) {
                        that.form.FromDateDesc = selectDate;
                    } else {
                        that.form.ToDateDesc = selectDate;
                    }
                }
            });
        },
        get_building_data: function() {
            var that = this;
            if (that.locationform.BranchCode <= 0) {
                that.locationform.FloorHeight = [];
                that.buildinglist = [];
                that.floorlist = [];
                ns.toast('请选择公司');
                return;
            }
            var options = {
                action: 'APP_GETALLBUILDINGBYBRANCHCODE',
                branchcode: that.locationform.BranchCode
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.buildinglist = data.list;
                    if (that.buildinglist.length > 0) {
                        that.buildinglist[0].isselected = true;
                        that.locationform.BuildingID = that.buildinglist[0].id;
                        that.locationform.BuildingName = that.buildinglist[0].title;
                        that.get_height_array(that.buildinglist[0].height);
                        that.get_room_data();
                        that.buildinglist.splice(0, 0, {
                            id: 0,
                            title: '请选择',
                            height: 0
                        });
                    }
                } else if (err) {
                    that.locationform.FloorHeight = [];
                    that.buildinglist = [];
                    that.floorlist = [];
                    ns.toast(err);
                }
            });
        },
        get_height_array: function(height) {
            var that = this;
            that.locationform.FloorHeight = [];
            for (var i = height; i > 0; i--) {
                that.locationform.FloorHeight.push(i);
            }
        },
        get_room_data: function() {
            var that = this;
            if (that.locationform.BuildingID <= 0) {
                return;
            }
            var options = {
                action: 'APP_GETPANDIANBUILDINGMODELWITHROOM',
                P1: that.locationform.BuildingID,
                P2: that.form.ID,
                typeids: that.locationform.TypeIDs
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.floorlist = data.list;
                } else if (err) {
                    that.floorlist = [];
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_choose_building: function() {
            var that = this;
            var item = null;
            for (var i = 0; i < that.buildinglist.length; i++) {
                if (that.buildinglist[i].id == that.locationform.BuildingID) {
                    item = that.buildinglist[i];
                    break;
                }
            }
            if (!item) {
                return;
            }
            that.get_height_array(item.height);
            that.locationform.BuildingName = item.title;
            that.locationform.BuildingID = item.id;
            that.get_room_data();
        },
        do_select_floor: function(height) {
            var that = this;
            that.locationform.FloorName = height + '楼';
            that.locationform.FloorID = height;
            that.locationform.LocationID = 0;
            if (that.canpandian) {
                return;
            }
            that.do_view_pandian_history(0);
        },
        do_select_room: function(item) {
            var that = this;
            that.locationform.FloorName = item.FloorID + '楼';
            that.locationform.FloorID = item.FloorID;
            that.locationform.LocationID = item.id;
            that.locationform.LocTitle = item.NickName;
            if (that.canpandian) {
                that.do_start_pandian();
                return;
            }
            that.do_view_pandian_history(0);
        },
        do_select_company: function() {
            var that = this;
            if (!that.canedit) {
                return;
            }
            var title = '选择公司';
            var name = 'choosemorecompany_frm';
            ns.openWin(name, title, {
                source: that.source,
                canchoosemorecompany: true,
                BranchCodes: that.form.BranchCodes
            });
        },
        do_select_my_company: function() {
            var that = this;
            var title = '选择公司';
            var name = 'choosecompany_frm';
            ns.openWin(name, title, {
                source: 'pandiantaskchangdi',
                BranchCode: that.locationform.BranchCode,
                CurrentBranchCodes: that.form.BranchCodes
            });
        },
        do_select_type: function() {
            var that = this;
            if (!that.canedit) {
                return;
            }
            var title = '选择资产分类';
            var name = 'choosemorezctype_frm';
            ns.openWin(name, title, {
                source: that.source,
                canchoosemorezctype: true,
                TypeIDs: that.form.TypeIDs
            });
        },
        do_select_my_type: function() {
            var that = this;
            var title = '选择资产分类';
            var name = 'choosemorezctype_frm';
            ns.openWin(name, title, {
                source: 'pandiantaskchangdi',
                TypeIDs: that.locationform.TypeIDs,
                CurrentTypeIDs: that.form.TypeIDs,
                canchoosemorezctype: true,
            });
        },
        getStatusClass: function(item) {
            var that = this;
            if (!item.NeedPD) {
                return 'nopanbtn';
            }
            return 'weipanbtn';
        },
        do_open_operation: function() {
            var that = this;
            var name = 'pandiantaskeditbtn_frm';
            var url = 'pandiantaskeditbtn_frm.html';
            ns.openFrame(name, url, {
                type: 'push'
            }, {
                id: that.form.ID,
                status: that.form.Status
            });
        },
        do_start_pandian_task: function() {
            var that = this;
            var title = '开始盘点';
            var name = 'pandiantaskedit_frm_new';
            ns.openWin(name, title, {
                canedit: false,
                cansavepandiantask: false,
                canpandian: true,
                id: that.form.ID,
                hideeditbtn: true,
                url: 'pandiantaskedit_frm.html',
                canscanpdlocation: true
            });
        },
        do_view_pandian_history: function(type) {
            var that = this;
            if (that.locationform.BranchCode <= 0) {
                ns.toast('请选择公司');
                return;
            }
            var BuildingID = that.locationform.BuildingID;
            var FloorID = that.locationform.FloorID;
            var LocationID = that.locationform.LocationID;
            var LocationTitle = that.locationform.LocTitle;
            var title = "盘点情况";
            if (type == 1) { //查看任务盘点详情
                BuildingID = 0;
                FloorID = 0;
                LocationID = 0;
                LocationTitle = that.form.Title;
            } else if (type == 2) { //查看大楼盘点详情
                if (BuildingID <= 0) {
                    ns.toast('请选择大楼');
                    return;
                }
                FloorID = 0;
                LocationID = 0;
                LocationTitle = that.locationform.BuildingName;
            }
            var name = 'pandianedit_frm';
            ns.openWin(name, title, {
                TaskID: that.form.ID,
                BranchCode: that.locationform.BranchCode,
                BuildingID: BuildingID,
                FloorID: FloorID,
                LocationID: LocationID,
                cansavepandian: false,
                canedit: false,
                TaskStatus: that.form.Status,
                LocationTitle: LocationTitle
            });
        },
        do_start_pandian: function() {
            var that = this;
            if (that.locationform.LocationID <= 0) {
                ns.toast('请选择场地');
                return;
            }
            var name = 'pandianstart_win';
            var url = '../html/pandianstart_win.html';
            ns.openDirectWin(name, url, {
                TaskID: that.form.ID,
                LocationID: that.locationform.LocationID,
                cansavepandian: true,
                canedit: true,
                TaskStatus: that.form.Status
            });
        },
        do_edit_task: function() {
            var that = this;
            var title = '编辑盘点单';
            var name = 'pandiantaskedit_frm_new';
            ns.openWin(name, title, {
                canedit: true,
                cansavepandiantask: true,
                id: that.form.ID,
                hideeditbtn: true,
                url: 'pandiantaskedit_frm.html'
            });
        },
        do_complete: function(Status) {
            var that = this;
            var msg = Status == 0 ? '确认完成该盘点单?' : '确认取消完成该盘点单';
            var action = Status == 0 ? 'APP_COMPLETEPDTASK' : 'APP_CANCELCOMPLETEPDTASK';
            ns.confirm({
                msg: msg
            }, function() {
                api.closeFrame({
                    name: 'pandiantaskeditbtn_frm'
                });
                var options = {
                    action: action,
                    P1: that.form.ID,
                }
                ns.post(options, function(succeed, data, err) {
                    if (succeed) {
                        ns.toast('操作成功');
                        app.reload_list();
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
        reload_list: function() {
            api.sendEvent({
                name: 'reloadpandiantaskedit',
            });
            api.sendEvent({
                name: 'reloadpandiantasklist',
            });
        },
        covertstatus: function(status) {
            if (status == 0)
                return "已完成";
            else if (status == 10)
                return "盘点中";
        },
        roomStyle: function(height) {
            var that = this;
            var total = 0;
            for (var i = 0; i < that.floorlist.length; i++) {
                var item = that.floorlist[i];
                if (item.FloorID == height) {
                    total++;
                }
            }
            return 'width:' + (70 * total) + 'px';
        },
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.ID = ns.getPageParam('id') || 0;
    app.canedit = ns.getPageParam('canedit') || false;
    app.hideeditbtn = ns.getPageParam('hideeditbtn') || false;
    app.canpandian = ns.getPageParam('canpandian') || false;
    app.get_data();
    api.addEventListener({
        name: 'reloadpandiantaskedit'
    }, function(ret) {
        app.get_data();
    });
    api.addEventListener({
        name: 'do_save_pandiantask'
    }, function(ret) {
        app.do_save();
    });
    api.addEventListener({
        name: 'do_open_pd_complete'
    }, function(ret) {
        app.do_complete(ret.value.status);
    });
    api.addEventListener({
        name: 'do_choose_zccompany_complete'
    }, function(ret) {
        if (ret.value.source == 'pandiantaskchangdi') {
            if (ret.value) {
                app.locationform.BranchCode = ret.value.id;
                app.locationform.DeptName = ret.value.name;
                app.get_building_data();
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_more_zccompany_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.BranchCodes = ret.value.ids;
                app.form.DeptNames = ret.value.names;
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_more_zctype_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.TypeTitles = ret.value.names;
                app.form.TypeIDs = ret.value.ids;
            }
        }
        if (ret.value.source == 'pandiantaskchangdi') {
            if (ret.value) {
                app.locationform.TypeIDs = ret.value.ids;
                app.locationform.TypeTitles = ret.value.names;
                app.get_building_data();
            }
        }
    });
    api.addEventListener({
        name: 'do_open_pd_edit'
    }, function(ret) {
        app.do_edit_task();
    });
    api.addEventListener({
        name: 'do_start_pandian'
    }, function(ret) {
        app.do_start_pandian_task();
    });
    api.addEventListener({
        name: 'do_open_scan_location'
    }, function(ret) {
        ns.openDirectWin('scanner_frm', '../html/scanner_frm.html', {
            pandianroom: true
        })
    });
    api.addEventListener({
        name: 'do_open_pandianroom_page'
    }, function(ret) {
        if (ret.value && ret.value.id) {
            app.locationform.LocationID = ret.value.id;
            app.do_start_pandian();
        }
    });
}
