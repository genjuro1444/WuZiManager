var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            BranchCode: 0,
            DeptName: '',
            Abbre:'',
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
        source: 'chooselocation',
    },
    methods: {
        get_building_data: function () {
            var that = this;
            if (that.form.BranchCode <= 0) {
                that.form.FloorHeight = [];
                that.buildinglist = [];
                that.floorlist = [];
                ns.toast('请选择公司');
                return;
            }
            var options = {
                action: 'APP_GETALLBUILDINGBYBRANCHCODE',
                branchcode: that.form.BranchCode
            };
            var BuildingID = that.form.BuildingID;
            ns.post(options, function (succeed, data, err) {
                if (succeed) {
                    that.buildinglist = data.list;
                    if (that.buildinglist.length > 0) {
                        var building = that.buildinglist[0];
                        if (BuildingID > 0) {
                            for (var i = 0; i < that.buildinglist.length; i++) {
                                if (that.buildinglist[i].id == BuildingID) {
                                    building = that.buildinglist[i];
                                    break;
                                }
                            }
                        }
                        that.form.BuildingID = building.id;
                        that.form.BuildingName = building.title;
                        that.get_height_array(building.height);
                        that.get_room_data();
                        that.buildinglist.splice(0, 0, {
                            id: 0,
                            title: '请选择',
                            height: 0
                        });
                    }
                } else if (err) {
                    that.form.FloorHeight = [];
                    that.buildinglist = [];
                    that.floorlist = [];
                    ns.toast(err);
                }
            }, {
                    toast: true
                });
        },
        get_height_array: function (height) {
            var that = this;
            that.form.FloorHeight = [];
            for (var i = height; i > 0; i--) {
                that.form.FloorHeight.push(i);
            }
        },
        get_room_data: function () {
            var that = this;
            if (that.form.BuildingID <= 0) {
                return;
            }
            var options = {
                action: 'APP_GETBUILDINGMODELWITHROOM',
                buildingid: that.form.BuildingID
            };
            ns.post(options, function (succeed, data, err) {
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
        roomStyle: function (height) {
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
        do_choose_building: function () {
            var that = this;
            var item = null;
            for (var i = 0; i < that.buildinglist.length; i++) {
                if (that.buildinglist[i].id == that.form.BuildingID) {
                    item = that.buildinglist[i];
                    break;
                }
            }
            if (!item) {
                return;
            }
            that.get_height_array(item.height);
            that.form.BuildingName = item.title;
            that.form.BuildingID = item.id;
            that.get_room_data();
        },
        do_select_room: function (item) {
            var that = this;
            that.form.FloorName = item.FloorID + '楼';
            that.form.LocationID = item.id;
            that.form.LocTitle = item.title;
            that.do_save();
        },
        do_select_building: function () {
            var that = this;
            that.do_save();
        },
        do_save: function () {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择公司');
                return;
            }
            if (that.form.BuildingID <= 0) {
                ns.toast('请选择楼栋');
                return;
            }
            var LocationID = 0;
            if (that.form.LocationID <= 0) {
                LocationID = that.form.BuildingID;
            } else {
                LocationID = that.form.LocationID;
            }
            var fullName = that.form.BuildingName + that.form.FloorName + that.form.LocTitle;
            api.sendEvent({
                name: 'do_choose_location_complete',
                extra: {
                    id: LocationID,
                    name: fullName,
                    source: that.form.source
                }
            });
            that.set_selected_location();
            setTimeout(function () {
                api.closeWin();
            }, 100);
        },
        do_select_company: function () {
            var that = this;
            var title = '选择公司';
            var name = 'choosecompany_frm';
            ns.openWin(name, title, {
                source: that.source,
                BranchCode: that.form.BranchCode
            });
        },
        set_selected_location: function () {
            var that = this;
            if (that.form.BranchCode) {
                ns.setPrefs({
                    'location_branchcode': that.form.BranchCode
                });
            }
            if (that.form.DeptName) {
                ns.setPrefs({
                    'location_deptname': that.form.DeptName
                });
            }
            if (that.form.BuildingID) {
                ns.setPrefs({
                    'location_buildingid': that.form.BuildingID
                });
            }
        },
        get_selected_location: function () {
            var that = this;
            var BranchCode = ns.getPrefs('location_branchcode');
            if (BranchCode) {
                that.form.BranchCode = BranchCode;
            }
            var DeptName = ns.getPrefs('location_deptname');
            if (BranchCode) {
                that.form.DeptName = DeptName;
            }
            var BuildingID = ns.getPrefs('location_buildingid');
            if (BuildingID) {
                that.form.BuildingID = BuildingID;
            }
        }
    }
});
apiready = function () {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.source = ns.getPageParam('source') || '';
    app.form.BranchCode = ns.Get_Branch_Code();
    app.form.DeptName = ns.Get_Branch_Name();
    app.get_selected_location();
    app.get_building_data();
    api.addEventListener({
        name: 'do_choose_zccompany_complete'
    }, function (ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.BranchCode = ret.value.id;
                app.form.DeptName = ret.value.name;
            }
            app.get_building_data();
        }
    });
    api.addEventListener({
        name: 'do_save_choose_location'
    }, function () {
        app.do_save();
    });
}
