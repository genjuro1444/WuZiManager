var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        questions: [],
        haslist: true,
        errormsg: '暂无相关信息',
        form: {
            id: 0,
            title: ''
        },
        showsubmit: true,
        Remark: ''
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.ID = that.form.id;
            options.action = "getsurveyquestionsbyid";
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.form;
                    that.questions = data.questions;
                    if (that.questions.length == 0) {
                        that.haslist = false;
                    }
                } else {
                    that.haslist = false;
                    that.errormsg = err;
                }
            });
        },
        choose_option: function(option, questions) {
            var that = this;
            if (questions.type == 1) {
                for (var i = 0; i < questions.options.length; i++) {
                    if (questions.options[i].OptionID != option.OptionID) {
                        questions.options[i].Selected = false;
                    }
                }
            }
            option.Selected = !option.Selected;
        },
        check_option: function() {
            var that = this;
            var isAllSelect = true;
            for (var i = 0; i < that.questions.length; i++) {
                var isSelect = false;
                for (var j = 0; j < that.questions[i].options.length; i++) {
                    if (that.questions[i].options[j].Selected) {
                        isSelect = true;
                        continue;
                    }
                }
                if (!isSelect) {
                    isAllSelect = false;
                }
            }
            return isAllSelect;
        },
        do_open_save: function() {
            var that = this;
            var isAllSelect = that.check_option();
            if (!isAllSelect) {
                api.toast({
                    msg: '您尚未完成此调查问卷',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            that.showsubmit = true;
        },
        do_save: function() {
            var that = this;
            api.confirm({
                title: '提示',
                msg: '确认提交?',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    var options = {};
                    options.ID = that.form.id;
                    options.action = "savesurveyresponse";
                    options.list = JSON.stringify(that.questions);
                    ns.post(options, function(succeed, data, err) {
                        if (succeed) {
                            api.toast({
                                msg: '操作成功',
                                duration: 2000,
                                location: 'bottom'
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
                    }, {
                        toast: true,
                        toastmsg: '提交中'
                    });
                }
            });
        }
        // do_save: function() {
        //     var that = this;
        //     api.confirm({
        //         title: '提示',
        //         msg: '确认提交?',
        //         buttons: ['确定', '取消']
        //     }, function(ret, err) {
        //         if (ret.buttonIndex == 1) {
        //             var options = {};
        //             options.ID = that.form.id;
        //             options.action = "savesurveyresponse";
        //             options.Remark = that.Remark;
        //             options.list = JSON.stringify(that.questions);
        //             ns.post(options, function(succeed, data, err) {
        //                 if (succeed) {
        //                     api.toast({
        //                         msg: '操作成功',
        //                         duration: 2000,
        //                         location: 'bottom'
        //                     });
        //                 } else {
        //                     api.toast({
        //                         msg: err,
        //                         duration: 2000,
        //                         location: 'bottom'
        //                     });
        //                 }
        //             }, {
        //                 toast: true,
        //                 toastmsg: '提交中'
        //             });
        //         }
        //     });
        // }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.id = api.pageParam.id;
    toast = new auiToast();
    app.get_data();
};
