var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            username: '',
            phonenumber: '',
            detail: '',
            sex: '',
            password: '',
            repassword: '',
            codeissent: false,
            codesentcomplete: false,
            countdown: '',
            verifycode: '',
            isdefinerelation: false,
            moredetail: ''
        },
        GroupID: 0
    },
    methods: {
        do_select_type: function(type) {
            this.form.FamilyType = type;
        },
        get_data: function() {
            var that = this;
            if (that.form.id == 0) {
                return;
            }
            ns.post({
                action: 'getmyfamilydetail',
                id: that.form.id
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.form;
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_save: function() {
            var that = this;
            if (that.form.username == '') {
                api.toast({
                    msg: '请填写成员姓名',
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
            ns.post({
                action: 'savemyfamilyinfo',
                id: that.form.id,
                username: that.form.username,
                phonenumber: that.form.phonenumber,
                sex: that.form.sex,
                detail: that.form.detail,
                password: that.form.password,
                verifycode: that.form.verifycode,
                isdefinerelation: that.form.isdefinerelation,
                moredetail: that.form.moredetail,
                FamilyType: that.form.FamilyType,
                GroupID: that.GroupID
            }, function(succeed, data, err) {
                if (succeed) {
                    api.toast({
                        msg: '保存成功',
                        duration: 2000,
                        location: 'bottom'
                    });
                    api.sendEvent({
                        name: 'save_family_complete'
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
        },
        choose_sex: function() {
            var that = this;
            api.actionSheet({
                cancelTitle: '关闭',
                buttons: ['男', '女']
            }, function(ret, err) {
                if (ret.buttonIndex == 1) {
                    that.form.sex = '男';
                } else if (ret.buttonIndex == 2) {
                    that.form.sex = '女';
                }
            });
        },
        choose_relation: function() {
            var that = this;
            api.actionSheet({
                cancelTitle: '关闭',
                buttons: ['父亲', '母亲', '兄弟', '兄妹', '其他']
            }, function(ret, err) {
                if (ret.buttonIndex <= 5) {
                    that.form.isdefinerelation = false;
                }
                if (ret.buttonIndex == 1) {
                    that.form.detail = '父亲';
                } else if (ret.buttonIndex == 2) {
                    that.form.detail = '母亲';
                } else if (ret.buttonIndex == 3) {
                    that.form.detail = '兄弟';
                } else if (ret.buttonIndex == 4) {
                    that.form.detail = '兄妹';
                } else if (ret.buttonIndex == 5) {
                    that.form.detail = '其他';
                    that.form.isdefinerelation = true;
                }
            });
        },
        open_hotline: function() {
            var that = this;
            ns.post({
                action: 'getmallhotline'
            }, function(succeed, data, err) {
                if (succeed) {
                    ns.confirmPer('phone', function() {
                        api.call({
                            type: 'tel_prompt',
                            number: data.hotline
                        });
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
    app.GroupID = api.pageParam.GroupID || 0;
    app.get_data();
}
