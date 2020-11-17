var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        list: [{
            id: 0,
            imageurl: '../image/error-img.png',
            title: 'aadddsfaf是大多数发放',
            summary: 'dsafdfd',
            votecountdesc: '总票数:100',
            canvote: true,
            votedesc: '投我一票'
        }, ],
        haslist: true,
        errormsg: '暂无相关信息',
        form: {
            id: 0,
            title: '投票测试',
            summary: ''
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.ID = that.form.id;
            options.action = "getsurveyvotesbyid";
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                  //alert(JSON.stringify(data));
                    that.form = data.form
                    that.list = data.list;
                    if (that.list.length == 0) {
                        that.haslist = false;
                    }
                } else {
                    that.haslist = false;
                    that.errormsg = err;
                }
            });
        },
        do_vote: function(item) {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确认投他一票?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    var options = {};
                    options.action = "savesurveyvoteresponse";
                    options.id = item.id;
                    ns.post(options, function(succeed, data, err) {
                        if (succeed) {
                            api.toast({
                                msg: '投票成功',
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
                    }, { toast: true, toastmsg: '提交中' });
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.id = api.pageParam.id;
    toast = new auiToast();
    app.get_data();
};
