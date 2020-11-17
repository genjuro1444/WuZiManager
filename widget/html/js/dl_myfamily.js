var ns;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        GroupID: 0,
        canAdd: false
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getmyfamilylist'
            }, function(succeed, data, err) {
                if (succeed) {
                    that.list = data.list;
                    that.GroupID = data.GroupID;
                    that.canAdd = data.canAdd;
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_add: function(title, id, isMain) {
            var that = this;
            if (isMain) {
                return;
            }
            ns.openWin('dl_myfamilyadd_frm', title, {
                id: id,
                GroupID: that.GroupID
            }, {
                needlogin: true
            });
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
                        action: 'removemyfamily',
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
        }
    }
});

apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
    api.addEventListener({
        name: 'save_family_complete'
    }, function() {
        app.get_data();
    });
}
