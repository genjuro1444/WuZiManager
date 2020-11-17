var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            nickname: '',
        }
    },
    methods: {
        do_save: function() {
            var that = this;
            if (that.form.nickname == '') {
                api.toast({
                    msg: '请输入昵称',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            ns.post({
                action: 'savemynickname',
                nickname: that.form.nickname,
            }, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '修改成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    api.sendEvent({
                        name: 'changeuserinfosuccess'
                    });
                    setTimeout(function() {
                        api.closeWin();
                    }, 1000);
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
    api.parseTapmode();
    ns = window.Foresight.Util;
};