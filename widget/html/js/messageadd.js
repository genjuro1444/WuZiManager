var ns, toast, actionsheet;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            ID: 0,
        },
        source: 'messageadd'
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {
                action: 'APP_GETMESSAGEMODEL',
                P1: that.form.ID
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form = data;
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_save: function() {
            var that = this;
            var options = {
                action: 'APP_ADDMESSAGE',
                P1: JSON.stringify(that.form)
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
                toast: true,
                toastmsg: '提交中'
            });
        },
        reload_list: function() {
            api.sendEvent({
                name: 'do_reload_messagelist'
            });
        },
        do_select_company: function() {
            var that = this;
            var title = '选择公司';
            var name = 'choosemorecompany_frm';
            ns.openWin(name, title, {
                source: that.source,
                canchoosemorecompany: true,
                BranchCodes: that.form.BranchTO
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.form.ID = ns.getPageParam('id') || 0;
    app.get_data();
    api.addEventListener({
        name: 'do_reload_homeself'
    }, function() {
        app.get_data();
    });
    api.addEventListener({
        name: 'do_choose_more_zccompany_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.BranchTO = ret.value.ids;
                app.form.DeptNames = ret.value.names;
            }
        }
    });
}
