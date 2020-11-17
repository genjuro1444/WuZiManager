var app, toast;
app = new Vue({
    el: '#app',
    data: {
        list: [],
        HeJiCost: 0,
        paymentmethods: [],
        allchecked: false,
        calMonth: '',
        paymentid: 0
    },
    methods: {
        get_data: function() {
            var that = this;
            that.get_fee_data();
        },
        get_fee_data: function() {
            var that = this;
            ns.post({
                action: 'getnewroomfeebyuserid',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.list = data.list;
                    that.calculateTotalFee();
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_reduce_month: function(item, roomitem) {
            var that = this;
            if (!item.IsCanSelect) {
                return;
            }
            if (!item.NeedChargeWechatAll) {
                item.Selected = true;
            } else {
                roomitem.Selected = true;
            }
            if (item.CalMonthNumber > 0) {
                if (item.MonthAddCount > item.MinMonthAddNumber) {
                    item.MonthAddCount--;
                }
                item.CalMonthNumber = item.MonthAddNumber * item.MonthAddCount;
            }
            that.get_roomfee_bytime(item, roomitem);
        },
        do_add_month: function(item, roomitem) {
            var that = this;
            if (!item.IsCanSelect) {
                return;
            }
            if (!item.NeedChargeWechatAll) {
                item.Selected = true;
            } else {
                roomitem.Selected = true;
            }
            if (item.MaxMonthAddNumber >= 0 && item.CalMonthNumber >= item.MaxMonthAddNumber) {
                item.CalMonthNumber = item.MaxMonthAddNumber;
            } else {
                item.MonthAddCount++;
                item.CalMonthNumber = item.MonthAddNumber * item.MonthAddCount;
                if (item.MaxMonthAddNumber >= 0 && item.CalMonthNumber >= item.MaxMonthAddNumber) {
                    item.CalMonthNumber = item.MaxMonthAddNumber;
                }
            }
            that.get_roomfee_bytime(item, roomitem);
        },
        do_select_room: function(item) {
            var that = this;
            item.Selected = !item.Selected;
            for (var i = 0; i < item.list.length; i++) {
                if (!item.list[i].IsCanSelect) {
                    item.list[i].Selected = false;
                    continue;
                }
                item.list[i].Selected = item.Selected;
            }
            that.calculateTotalFee();
        },
        choose_fee: function(item) {
            var that = this;
            if (!item.IsCanSelect || item.NeedChargeWechatAll) {
                return;
            }
            item.Selected = !item.Selected;
            that.calculateTotalFee();
        },
        calculateTotalFee: function() {
            var that = this;
            total_fee = 0;
            for (var index = 0; index < that.list.length; index++) {
                var item = that.list[index];
                for (var index1 = 0; index1 < item.list.length; index1++) {
                    var item1 = item.list[index1];
                    //绑定缴费
                    if (item1.NeedChargeWechatAll && item1.IsCanSelect && item.Selected) {
                        total_fee += item1.TotalCost;
                        if (item1.childfee) {
                            for (var index2 = 0; index2 < item1.childfee.length; index2++) {
                                total_fee += item1.childfee[index2].TotalCost;
                            }
                        }
                    }
                    //单独缴费
                    else if (!item1.NeedChargeWechatAll && item1.IsCanSelect && item1.Selected) {
                        total_fee += item1.TotalCost;
                        if (item1.childfee) {
                            for (var index2 = 0; index2 < item1.childfee.length; index2++) {
                                total_fee += item1.childfee[index2].TotalCost;
                            }
                        }
                    }
                }
            }
            that.HeJiCost = total_fee;
        },
        get_roomfee_bytime: function(item, roomitem) {
            var that = this;
            ns.post({
                action: 'getroomfeebyid',
                id: item.ID,
                endtime: item.EndTime,
                CalMonthNumber: item.CalMonthNumber,
                ChargeID: item.ChargeID,
                StartTime: item.StartTime,
                AutoToMonthEnd: item.AutoToMonthEnd ? 1 : 0
            }, function(succeed, data, err) {
                if (succeed) {
                    if (data.isOverEndTime) {

                    }
                    item.TotalCost = data.TotalCost;
                    item.EndTime = data.EndTime;
                    that.calculateTotalFee();
                    var totalFee = 0;
                    for (var i = 0; i < roomitem.list.length; i++) {
                        totalFee += roomitem.list[i].TotalCost;
                    }
                    roomitem.TotalCost = '￥' + totalFee.toFixed(2);
                }
            });
        },
        get_pay_idlist: function() {
            var that = this;
            var idlist = [];
            for (var index = 0; index < that.list.length; index++) {
                var item = that.list[index];
                var list = that.list[index].list;
                for (var index1 = 0; index1 < list.length; index1++) {
                    var item1 = list[index1];
                    //绑定缴费
                    if (item1.NeedChargeWechatAll && item1.IsCanSelect && item.Selected) {
                        idlist.push({
                            ID: item1.ID,
                            EndTime: item1.EndTime.replace('T', ' ')
                        });
                        if (item1.childfee) {
                            for (var index2 = 0; index2 < item1.childfee.length; index2++) {
                                var item2 = item1.childfee[index2];
                                idlist.push({
                                    ID: item2.ID,
                                    EndTime: item2.EndTime.replace('T', ' ')
                                });
                            }
                        }
                    }
                    //单独缴费
                    else if (!item1.NeedChargeWechatAll && item1.Selected && item1.IsCanSelect) {
                        idlist.push({
                            ID: item1.ID,
                            EndTime: item1.EndTime.replace('T', ' ')
                        });
                        if (item1.childfee) {
                            for (var index2 = 0; index2 < item1.childfee.length; index2++) {
                                var item2 = item1.childfee[index2];
                                idlist.push({
                                    ID: item2.ID,
                                    EndTime: item2.EndTime.replace('T', ' ')
                                });
                            }
                        }
                    }
                }
            }
            return idlist;
        },
        select_all: function() {
            var that = this;
            that.allchecked = !that.allchecked;
            for (var i = 0; i < that.list.length; i++) {
                that.list[i].Selected = that.allchecked;
                var list = that.list[i].list;
                for (var j = 0; j < list.length; j++) {
                    var current = list[j];
                    if (!current.IsCanSelect) {
                        current.Selected = false;
                    } else {
                        current.Selected = that.allchecked;
                    }
                }
            }
            that.calculateTotalFee();
        },
        open_history: function(item) {
            var that = this;
            ns.openWin('dl_wyjiaofeihistory_frm', '历史账单', {
                id: item.RoomID
            });
        },
        do_open_fee: function(item) {
            item.IsOpen = !item.IsOpen;
        },
        do_pay: function() {
            var that = this;
            if (that.HeJiCost <= 0) {
                api.toast({
                    msg: '支付金额不能为0',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            var idlist = that.get_pay_idlist();
            toast.loading({
                title: '提交中',
                duration: 2000
            }, function(ret) {});
            ns.post({
                action: 'readypayroomfee',
                total_fee: that.HeJiCost,
                idlist: JSON.stringify(idlist)
            }, function(succeed, data, err) {
                if (succeed && data.paymentid > 0) {
                    that.paymentid = data.paymentid;
                    that.do_confirm_order();
                } else {
                    toast.hide();
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                    that.show_history_haslist = false;
                }
            });
        },
        do_confirm_order: function() {
            var that = this;
            ns.post({
                action: 'createfeeorder',
                paymentid: that.paymentid,
            }, function(succeed, data, err) {
                toast.hide();
                if (succeed) {
                    that.open_orderpay(data.id);
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        open_orderpay: function(orderid) {
            var that = this;
            var name = 'dl_orderpay_frm';
            api.openFrame({
                name: name,
                url: name + '.html',
                bounces: false,
                pageParam: {
                    paymentid: that.paymentid,
                    id: orderid
                },
                rect: {
                    x: 0,
                    y: 0,
                    w: 'auto',
                    h: 'auto',
                    marginBottom: 0
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.get_data();
};
