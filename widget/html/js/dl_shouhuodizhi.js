var ns;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        type: 0, //5-选择收货地址
        canaddaddress: false,
        longPressLoop: null,
        maskid: 0
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getmyaddresslist'
            }, function(succeed, data, err) {
                if (succeed) {
                    that.list = data.list;
                    that.canaddaddress = data.canaddaddress;
                    setTimeout(function() {
                        that.doLongPress();
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
        do_add: function(title, id) {
            var that = this;
            ns.openWin('dl_shouhuodizhiadd_frm', title, {
                id: id
            });
            that.clearMask();
        },
        do_remove: function(id) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确认删除?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    ns.post({
                        action: 'removemyaddress',
                        id: id
                    }, function(succeed, data, err) {
                        if (succeed) {
                            api.toast({
                                msg: '删除成功',
                                duration: 2000,
                                location: 'bottom'
                            });
                            that.get_data();
                        } else {
                            api.toast({
                                msg: err,
                                duration: 2000,
                                location: 'bottom'
                            });
                        }
                    });
                }
            });
        },
        do_choose: function(item) {
            var that = this;
            if (that.type != 5) {
                return;
            }
            api.setPrefs({
                key: 'selected_address_id',
                value: item.id
            });
            api.sendEvent({
                name: 'selected_address_id_complete'
            });
            setTimeout(function() {
                api.closeWin();
            }, 500)
        },
        longTimeTouch: function(id) {
            var that = this;
            clearTimeout(that.longPressLoop); //再次清空定时器，防止重复注册定时器
            that.longPressLoop = setTimeout(function() {
                that.maskid = id;
            }.bind(this), 500);
        },
        // 长按结束清空定时器
        emptyTime: function() {
            if (this.longPressLoop) {
                clearTimeout(this.longPressLoop); //清空定时器，防止重复注册定时器
            }
        },
        clearMask: function() {
            this.emptyTime();
            this.maskid = 0;
        },
        doLongPress: function() {
            var that = this;
            var addresses = document.getElementsByClassName("shdz_main");
            for (var i = 0; i < addresses.length; i++) {
                (function(i) {
                    var id = $api.attr(addresses[i], 'data-id');
                    // var IsRelationAddress = $api.attr(addresses[i], 'data-relate');
                    // if (IsRelationAddress) {
                    //     return;
                    // }
                    addresses[i].ontouchstart = function() {
                        that.longTimeTouch(id);
                    };
                    addresses[i].ontouchend = function() {
                        that.emptyTime(id);
                    };
                })(i);
            }
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.type = api.pageParam.type;
    app.get_data();
    api.addEventListener({
        name: 'save_address_complete'
    }, function() {
        app.get_data();
    });
}
