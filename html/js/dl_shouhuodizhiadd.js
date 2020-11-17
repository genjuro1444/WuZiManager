var ns;
var app = new Vue({
    el: '#app',
    data: {
        selected_address_info: '',
        form: {
            id: 0,
            username: '',
            phonenumber: '',
            addressdetail: '',
            provinceID: 0,
            province: '',
            city: '',
            district: '',
            isdefault: false,
            isroomaddress: false,
            roomname: '',
            roomid: 0,
            xiaoquid: 0,
            xiaoquname: ''
        },
        isCityEnable: false
    },
    methods: {
        get_data: function() {
            var that = this;
            if (that.form.id == 0) {
                return;
            }
            ns.post({
                action: 'getmyaddressdetail',
                id: that.form.id
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.form;
                    that.set_address_info();
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        set_address_info: function() {
            var that = this;
            that.selected_address_info = '';
            if (that.form.province != '') {
                that.selected_address_info += that.form.province;
            }
            if (that.form.city != '') {
                if (that.selected_address_info != '') {
                    that.selected_address_info += '-';
                }
                that.selected_address_info += that.form.city;
            }
            if (that.form.district != '') {
                if (that.selected_address_info != '') {
                    that.selected_address_info += '-';
                }
                that.selected_address_info += that.form.district;
            }
            if (that.form.isroomaddress) {
                if (that.selected_address_info != '') {
                    that.selected_address_info += '-';
                }
                that.selected_address_info += that.form.xiaoquname;
            }
        },
        choose_address: function() {
            var that = this;
            if (that.form.isroomaddress) {
                return;
            }
            // ns.openWin('myaddress_choosexiaoqu_frm', '选择小区', null, { needlogin: true });
            ns.openWin('myaddress_choose_frm', '选择地区', null, {
                needlogin: true
            });
        },
        choose_room: function() {
            var that = this;
            if (that.form.xiaoquid == 0) {
                api.toast({
                    msg: '请选择小区',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            ns.openWin('myaddress_chooseroom_frm', '选择房屋', {
                title: '选择房屋',
                url: 'myaddress_chooseroom_frm.html',
                id: that.form.xiaoquid
            }, {
                needlogin: true
            });
        },
        get_selected_address: function() {
            var that = this;
            that.form.isroomaddress = false;
            that.form.roomname = '';
            that.form.xiaoquid = 0;
            that.form.roomid = 0;
            that.form.addressdetail = '';
            api.getPrefs({
                key: 'selected_address_info'
            }, function(ret, err) {
                if (ret.value && ret.value != '') {
                    var address_array = ret.value.split('-');
                    that.form.provinceID = address_array[0];
                    that.form.province = address_array[1];
                    that.form.city = address_array[2];
                    that.form.district = address_array[3];
                    that.set_address_info();
                }
            });
        },
        get_selected_xiaoqu: function() {
            var that = this;
            that.form.isroomaddress = true;
            that.form.roomname = '';
            api.getPrefs({
                key: 'selected_xiaoqu_name'
            }, function(ret, err) {
                if (ret.value && ret.value != '') {
                    that.selected_address_info = ret.value;
                }
            });
            api.getPrefs({
                key: 'selected_xiaoqu_id'
            }, function(ret, err) {
                if (ret.value && ret.value != '') {
                    that.form.xiaoquid = ret.value;
                }
            });
        },
        get_selected_room: function() {
            var that = this;
            that.form.isroomaddress = true;
            api.getPrefs({
                key: 'selected_room_name'
            }, function(ret, err) {
                if (ret.value && ret.value != '') {
                    that.form.roomname = ret.value;
                }
            });
            api.getPrefs({
                key: 'selected_room_id'
            }, function(ret, err) {
                if (ret.value && ret.value != '') {
                    that.form.roomid = ret.value;
                }
            });
        },
        do_save: function() {
            var that = this;
            if (that.form.username == '') {
                api.toast({
                    msg: '请填写收货人姓名',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.form.phonenumber == '') {
                api.toast({
                    msg: '请填写手机号码',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (!that.isCityEnable) {
                if (that.form.xiaoquname == '') {
                    api.toast({
                        msg: '请选择房屋',
                        duration: 2000,
                        location: 'bottom'
                    });
                    return;
                }
            } else {
                if (that.form.city == '' || that.province == '' || that.district == '') {
                    api.toast({
                        msg: '请选择所在地区',
                        duration: 2000,
                        location: 'bottom'
                    });
                    return;
                }
                if (that.form.addressdetail == '') {
                    api.toast({
                        msg: '请填写详细地址',
                        duration: 2000,
                        location: 'bottom'
                    });
                    return;
                }
            }
            ns.post({
                action: 'savemyaddressinfo',
                id: that.form.id,
                provinceID: that.form.provinceID,
                province: that.form.province,
                city: that.form.city,
                district: that.form.district,
                username: that.form.username,
                phonenumber: that.form.phonenumber,
                addressdetail: that.form.addressdetail,
                isdefault: that.form.isdefault,
                xiaoquid: that.form.xiaoquid,
                roomid: that.form.roomid,
                xiaoquname: that.form.xiaoquname
            }, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '保存成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    api.sendEvent({
                        name: 'save_address_complete'
                    });
                    setTimeout(function() {
                        api.closeWin();
                    }, 1000);
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.id = api.pageParam.id || 0;
    app.get_data();
    api.addEventListener({
        name: 'select_address_complete'
    }, function() {
        setTimeout(function() {
            app.get_selected_address();
        }, 200)
    });
    api.addEventListener({
        name: 'select_xiaoqu_complete'
    }, function() {
        app.get_selected_xiaoqu();
    });
    api.addEventListener({
        name: 'select_room_complete'
    }, function() {
        app.get_selected_room();
    });
}
