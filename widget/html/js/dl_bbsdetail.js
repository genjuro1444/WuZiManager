var ns, toast, imageBrowser, UIInput;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            Name: '',
            AddTime: '',
            GroupName: '',
            Content: '',
            headimage: '../image/default_user.png'
        },
        imglist: [],
        comment: {
            Content: '',
            ResponseUserID: 0
        },
        commentlist: [],
        UIInputID: -1,
        havenocomments: false,
        show_keyboard: false
    },
    methods: {
        get_data: function() {
            var that = this;
            that.is_searching = true;
            that.can_scroll = false;
            var options = {};
            options.action = 'getthreaddetail';
            options.ID = that.form.id;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.form;
                    that.imglist = data.imglist;
                    for (var i = 0; i < that.imglist.length; i++) {
                        that.image_cache(that.imglist[i], i);
                    }
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            }, {
                toast: true
            });
        },
        get_comments: function() {
            var that = this;
            that.havenocomments = false;
            var options = {};
            options.action = 'getthreadcommentlist';
            options.ID = that.form.id;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.commentlist = data.commentlist;
                    if (that.commentlist.length == 0) {
                        that.havenocomments = true;
                    }
                } else if (err) {
                    that.havenocomments = true;
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        image_cache: function(item, index) {
            var that = this;
            if (that.imglist.length == 0) {
                return;
            }
            api.imageCache({
                url: item.url,
                thumbnail: false
            }, function(ret, err) {
                if (ret.status) {
                    that.imglist[index].cacheurl = ret.url;
                }
            });
        },
        img_browser: function(index) {
            var that = this;
            var imgurls = [];
            for (var i = 0; i < that.imglist.length; i++) {
                imgurls.push(that.imglist[i].url);
            }
            imageBrowser.openImages({
                imageUrls: imgurls,
                showList: false,
                activeIndex: index
            });
        },
        do_praise: function() {
            var that = this;
            if (that.form.ispraised) {
                return;
            }
            if (!that.form.cancomment) {
                return;
            }
            if (that.form.userforbiddened) {
                api.toast({
                    msg: '您已禁言',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            ns.post({
                id: that.form.id,
                action: 'postthreadpraise'
            }, function(succeed, data, err) {
                if (succeed) {
                    that.get_data();
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_post: function() {
            var that = this;
            if (!that.form.cancomment) {
                return;
            }
            if (that.form.userforbiddened) {
                api.toast({
                    msg: '您已禁言',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.comment.Content == '') {
                that.hide_keyboard();
                api.toast({
                    msg: '您什么也没留下',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            ns.post({
                id: that.form.id,
                action: 'postthreadcomment',
                Content: that.comment.Content,
                ResponseUserID: that.comment.ResponseUserID
            }, function(succeed, data, err) {
                if (succeed) {
                    that.get_comments();
                    that.comment.Content = '';
                    setTimeout(function() {
                        that.hide_keyboard();
                    }, 200);
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        start_post: function(UserID, UserName) {
            var that = this;
            if (!that.form.cancomment) {
                return;
            }
            if (that.form.userforbiddened) {
                api.toast({
                    msg: '您已禁言',
                    duration: 2000,
                    location: 'bottom'
                });
                return;
            }
            if (that.comment.Content) {
                return;
            }
            that.show_keyboard = true;
            var el = $api.byId('textarea')
            if (UserID > 0) {
                $api.attr(el, 'placeholder', '回复用户[' + UserName + ']...');
            } else {
                $api.attr(el, 'placeholder', '写点什么吧...');
            }
            that.comment.Content = '';
            that.comment.ResponseUserID = UserID;
            setTimeout(function() {
                that.resize_textarea();
            }, 200);
            if (api.systemType != 'ios') {
                setTimeout(function() {
                    that.open_input(true);
                }, 100);
                return;
            }
            that.open_input(true);
        },
        open_input: function(autoFocus) {
            var that = this;
            setTimeout(function() {
                var textarea = document.getElementById("textarea");
                if (textarea) {
                    textarea.focus();
                }
            }, 200);
            if (that.UIInputID == 0) {
                UIInput.value({
                    msg: ''
                });
                UIInput.show({
                    id: that.UIInputID
                });
                return;
            }
            UIInput.open({
                rect: {
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0
                },
                styles: {
                    bgColor: '#fff',
                    size: 14,
                    color: '#000',
                    placeholder: {
                        color: '#ccc'
                    }
                },
                autoFocus: autoFocus,
                maxRows: 4,
                placeholder: '写点什么吧...',
                keyboardType: 'text',
                fixedOn: api.frameName
            }, function(ret) {
                if (ret.eventType == 'change') {
                    UIInput.value(function(rec) {
                        if (rec) {
                            that.comment.Content = rec.msg;
                        }
                    });
                } else {
                    that.UIInputID = ret.id;
                }
            });
        },
        resize_textarea: function() {
            var text = document.getElementById("textarea");
            if (text) {
                autoTextarea(text, 0, 100);
            }
        },
        initial_setup: function() {
            var that = this;
            that.get_data();
            that.get_comments();
            that.resize_textarea();
            that.open_input(false);
        },
        hide_keyboard: function() {
            var that = this;
            that.show_keyboard = false;
            that.comment.ResponseUserID = 0;
            UIInput.hide({
                id: that.UIINputID
            });
            that.resize_textarea();
            var el = $api.byId('textarea');
            $api.attr(el, 'placeholder', '写点什么吧...');
        }
    }
});
apiready = function() {
    api.parseTapmode();
    imageBrowser = api.require('imageBrowser');
    UIInput = api.require('UIInput');
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.form.id = api.pageParam.id;
    app.initial_setup();
};
