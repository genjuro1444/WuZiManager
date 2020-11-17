var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            NickName: '',
            action: 'saveusernickname'
        }
    },
    methods: {
        dosave: function() {
            var that = this;
            if (that.form.NickName == '') {
                api.toast({
                    msg: '请输入新昵称',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            toast.loading({
                title: "提交中",
                duration: 2000
            }, function(ret) {});
            ns.post(that.form, function(succeed, data, err) {
                toast.hide();
                if (succeed) {
                    ns.setPrefs({
                        'username': that.form.NickName
                    });
                    api.sendEvent({
                        name: 'changecentersuccess'
                    });
                    api.toast({
                        msg: '修改成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    setTimeout(function() {
                        api.closeWin();
                    }, 500);
                } else if (err) {
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
    ns = window.Foresight.Util;
    toast = new auiToast();
}
