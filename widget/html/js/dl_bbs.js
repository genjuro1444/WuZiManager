var ns;
var app = new Vue({
    el: '#app',
    data: {
        menus: [],
        chatlist: [],
        CategoryID: 0,
        is_searching: true,
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getthreadlist',
                top: '20',
                CategoryID: that.CategoryID,
                type: 1,
            }, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    that.chatlist = data.chatlist;
                    setTimeout(function() {
                        that.menuFixed('top_menus');
                    }, 200)
                }
            });
        },
        get_menu: function() {
            var that = this;
            ns.post({
                action: 'getthreadlistmenu',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.menus = data.menus;
                    that.get_data();
                    setTimeout(function() {
                        that.menuFixed('top_menus');
                    }, 200)
                }
            });
        },
        do_search_all: function() {
            var that = this;
            that.CategoryID = 0;
            that.get_data();
        },
        check_post_status: function(callback, title, name, id) {
            ns.post({
                action: 'checkuserpostthreadstatus',
            }, function(succeed, data, err) {
                if (succeed) {
                    if (typeof callback == "function") {
                        callback.call(this, title, name, id);
                    }
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        open_win: function(title, name, id, checkpost) {
            var that = this;
            if (name == '') {
                return;
            }
            id = id || 0;
            if (checkpost) {
                that.check_post_status(that.open_win, title, name, id);
                return;
            }
            ns.openWin(name, title, {
                title: title,
                url: name + '.html',
                id: id
            }, {
                needlogin: true
            });
        },
        menuFixed: function(id) {
            var that = this;
            var obj = document.getElementById(id);
            var height = obj.offsetTop;
            window.onscroll = function() {
                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                var page_width = document.documentElement.offsetWidth || document.body.offsetWidth;
                if (scrollTop <= height) {
                    obj.style.position = 'static';
                    obj.style.left = 0;
                    obj.style.right = 0;
                    obj.style.width = '100%';
                } else {
                    obj.style.position = 'fixed';
                    obj.style.top = 0;
                    obj.style.left = '10px';
                    obj.style.right = '10px';
                    obj.style.width = (page_width - 20) + 'px';
                }
            }
        },
        do_search_baike: function(item) {
            var that = this;
            for (var i = 0; i < that.menus.length; i++) {
                that.menus[i].is_active = false;
            }
            item.is_active = true;
            that.CategoryID = item.id;
            that.get_data();
        },
        do_praise: function(item) {
            var that = this;
            if (item.ispraised) {
                return;
            }
            ns.post({
                action: 'checkuserpostthreadstatus',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.do_post_thread(item);
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_post_thread: function(item) {
            var that = this;
            ns.post({
                id: item.id,
                action: 'postthreadpraise'
            }, function(succeed, data, err) {
                if (succeed) {
                    item.ispraised = true;
                    if (data.count) {
                        item.praisecount = data.count;
                        item.praisecountdesc = data.count;
                    }
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
    app.get_menu();
    api.addEventListener({
        name: 'updatabbs'
    }, function(ret, err) {
        if (ret) {
            app.get_data();
        } else {}
    });
    api.addEventListener({
        name: 'open_bbs_input'
    }, function(ret, err) {
        if (ret) {
            ns.openWin('dl_bbspost_frm', '发帖')
        } else {}
    });
    var pullRefresh = new auiPullToRefresh({
        container: document.querySelector('.aui-refresh-content'),
        triggerDistance: 100
    }, function(ret) {
        if (ret.status == "success") {
            setTimeout(function() {
                app.get_data();
                pullRefresh.cancelLoading(); //刷新成功后调用此方法隐藏
                var header = $api.byId('aui-header');
                $api.css(header, 'display:block');
            }, 1500)
        } else {
            var header = $api.byId('aui-header');
            $api.css(header, 'display:block');
        }
    }, function(ret) {
        if (ret.distance > 0) {
            var header = $api.byId('aui-header');
            $api.css(header, 'display:none');
        }
    })
};
