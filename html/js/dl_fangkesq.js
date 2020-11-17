var ns;
var inint_myDate = new Date();
var inint_getDateY = inint_myDate.getFullYear();
var inint_getDateM = inint_myDate.getMonth() + 1;
var inint_getDateD = inint_myDate.getDate();
var app = new Vue({
    el: '#app',
    data: {
        date: {
            starttime: '',
            endtime: '',
            datetype: 1, //1-今天 2-明天 3-自定义,
            maxendday: 3,
            visittype: 0,
            ProjectID: 0,
            username:'',
            phonenumber:'',
            peoplecount:'',
            idcardnumber:'',
        },
        validity: {
            num: '0',
            maxNum: '10'
        },
        visitor_purpose: [
        //   {
        //     id: '1',
        //     title: '中介看房',
        //     isdefault: true,
        //     noRestriction: false,
        //     msg: '（仅限1次）'
        // }
      ],
        ProjectList: [{
            id: 1,
            text: 'Monday',
            status: 'normal'
        }],
        FullName: '',
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getmallvisitdata'
            }, function(succeed, data, err) {
                if (succeed) {
                    if (data.roomlist.length == 0) {
                        ns.toast('您没有相关房间');
                        return;
                    }
                    if (data.roomlist.length > 0) {
                        that.ProjectList = data.roomlist;
                    }
                    if (that.ProjectList.length > 0) {
                        that.FullName = that.ProjectList[0].Name;
                        that.date.ProjectID = that.ProjectList[0].ID;
                    }
                    that.visitor_purpose = data.typelist;
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        choiceDate: function(num) {
            var that = this;
            var myDate = new Date();
            api.openPicker({
                type: 'date_time',
                date: that.date.starttime,
                title: '选择时间'
            }, function(ret, err) {
                if (ret) {
                    var selectDateStr = ret.year + '-' + (ret.month > 10 ? ret.month : '0' + ret.month) + '-' + (ret.day > 10 ? ret.day : ret.day);
                    var selectDate = ns.parseDateTime(selectDateStr);
                    var nowDateStr = ns.DateFormat(new Date(), 'yyyy-MM-dd');
                    var nowDate = ns.parseDateTime(nowDateStr);
                    if (selectDate < nowDate) {
                        ns.toast('请选择有效日期');
                        return;
                    }
                    if (num == 1) {
                        nowDate.setDate(nowDate.getDate() + that.date.maxendday);
                        if (selectDate > nowDate) {
                            ns.toast('请选择有效日期');
                            return;
                        }
                        if (that.date.endtime != '') {
                            var endDate = ns.parseDateTime(that.date.endtime);
                            if (selectDate > endDate) {
                                ns.toast('开始日期不能大于结束日期');
                                return;
                            }
                        }
                        that.date.starttime = selectDateStr;
                    } else if (num == 2) {
                        nowDate.setDate(nowDate.getDate() + that.date.maxendday);
                        if (that.date.starttime != '') {
                            var startDate = ns.parseDateTime(that.date.starttime);
                            if (selectDate < startDate) {
                                ns.toast('开始日期不能大于结束日期');
                                return;
                            }
                        }
                        that.date.endtime = selectDateStr;
                    }
                } else {}
            });
        },
        do_select_purpose: function(item) {
            var that = this;
            for (var i = 0; i < that.visitor_purpose.length; i++) {
                that.visitor_purpose[i].isdefault = false;
            }
            item.isdefault = true;
            that.date.visittype = item.id;
        },
        do_select_datetype: function(type) {
            var that = this;
            that.date.datetype = type;
        },
        do_save: function() {
            var that = this;
            if (that.date.ProjectID <= 0) {
                ns.toast('请选择房间');
                return;
            }
            if (that.date.visittype <= 0) {
                ns.toast('请选择访客目的');
                return;
            }
            if (that.date.datetype == 3 && (that.date.starttime == '' || that.endtime == '')) {
                ns.toast('请选择访客日期');
                return;
            }
            if (that.validity.num <= 0) {
                ns.toast('请请填写访问次数');
                return;
            }
            ns.post({
                action: 'savemallvisit',
                VisitType: that.date.visittype,
                ProjectID: that.date.ProjectID,
                UseCount: that.validity.num,
                DateType: that.date.datetype,
                UseStartTime: that.date.starttime,
                UseEndTime: that.date.endtime,
                username: that.date.username,
                phonenumber: that.date.phonenumber,
                peoplecount: that.date.peoplecount,
                idcardnumber: that.date.idcardnumber,
            }, function(succeed, data, err) {
                if (succeed) {
                    ns.toast('保存成功');
                    setTimeout(function() {
                        ns.openWin('dl_myvisitor_share_frm', '查看二维码', {
                            title: '查看二维码',
                            url: 'dl_myvisitor_share_frm.html',
                            id:data.ID
                        });
                    }, 500);
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        add_num: function(num) {
            var that = this;
            that.validity.num = parseInt(num) + 1;
            if (parseInt(num) >= parseInt(that.validity.maxNum)) {
                api.toast({
                    msg: '访问次数不能超过' + that.validity.maxNum + '次',
                    duration: 2000,
                    location: 'bottom'
                });
                that.validity.num = that.validity.maxNum;
            } else {
                that.validity.num = parseInt(num) + 1;
            }
        },
        sub_num: function(num) {
            var that = this;
            if (parseInt(num) < 1) {
                that.validity.num = 0;
            } else {
                that.validity.num = parseInt(num) - 1;
            }
        },
        do_select_room: function() {
            var that = this;
            var list = that.ProjectList;
            if (list.length == 0) {
                return;
            }
            var UIMultiSelector = api.require('UIMultiSelector');
            UIMultiSelector.open({
                rect: {
                    h: 244
                },
                text: {
                    title: '选择房间',
                    leftBtn: '取消',
                    rightBtn: '完成',
                    selectAll: ''
                },
                max: 0,
                singleSelection: true,
                styles: {
                    bg: '#fff',
                    mask: 'transparent',
                    title: {
                        bg: '#ddd',
                        color: '#808080',
                        size: 16,
                        h: 44
                    },
                    leftButton: {
                        bg: '#FF0000',
                        w: 80,
                        h: 35,
                        marginT: 5,
                        marginL: 8,
                        color: '#fff',
                        size: 14
                    },
                    rightButton: {
                        bg: '#FF0000',
                        w: 80,
                        h: 35,
                        marginT: 5,
                        marginR: 8,
                        color: '#fff',
                        size: 14
                    },
                    item: {
                        h: 35,
                        bg: '#fff',
                        bgActive: '#FF0000',
                        bgHighlight: '#FF0000',
                        color: '#808080',
                        active: '#fff',
                        highlight: '#fff',
                        size: 14,
                        lineColor: '#ddd',
                        textAlign: 'center'
                    },
                    icon: {
                        w: 0,
                        marginH: 0
                    }
                },
                animation: true,
                items: list
            }, function(ret, err) {
                if (ret) {
                    if (ret.eventType == 'clickRight') {
                        if (ret.items.length > 0) {
                            that.date.ProjectID = ret.items[0].id;
                            that.FullName = ret.items[0].Name;
                        }
                        UIMultiSelector.close();
                    }
                    if (ret.eventType == 'clickLeft' || ret.eventType == 'clickMask') {
                        UIMultiSelector.close();
                    }
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
};
