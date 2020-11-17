var ns, toast, map;
var app = new Vue({
    el: '#app',
    data: {
        menus: [],
        sub_menus: [],
        list: [],
        categoryid: 0,
        tagid: 0,
        get_category: 1,
        current_sortby: 3,
        form: {
            pageindex: 0,
            pagesize: 10,
            issuggestion: 0
        },
        current_item_length: 0,
        is_searching: false,
        scroll_top: 0,
        can_scroll: true,
        sortorders: [{
            title: '距离最近',
            index: 3,
            is_active: true
        }, {
            title: '销量最高',
            index: 1,
            is_active: false
        }, {
            title: '最新入驻',
            index: 2,
            is_active: false
        }, ],
        type: 0
    },
    methods: {
        check_current_sort: function() {
            var that = this;
            if (that.type == 23) {
                for (var i = 0; i < that.sortorders.length; i++) {
                    that.sortorders[i].is_active = false;
                }
                that.current_sortby = 1;
                that.sortorders[1].is_active = true;
            }
        },
        get_data: function() {
            var that = this;
            map.getLocation({
                accuracy: '10m',
                autoStop: true,
                filter: 1
            }, function(ret, err) {
                var lon = '',
                    lat = '';
                if (ret.status) {
                    lon = ret.lon;
                    lat = ret.lat;
                }
                that.get_list(lon, lat);
            });
        },
        get_list: function(lon, lat) {
            var that = this;
            that.is_searching = true;
            that.can_scroll = false;
            var options = {};
            options.action = 'getbusinesslistbycategoryid';
            options.pageindex = that.form.pageindex;
            options.pagesize = that.form.pagesize;
            options.get_category = that.get_category;
            options.categoryid = that.categoryid;
            options.tagid = that.tagid;
            options.sortby = that.current_sortby;
            options.type = 'businesscategory';
            options.lon = lon;
            options.lat = lat;
            options.issuggestion = that.form.issuggestion;
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    if (that.get_category == 1) {
                        that.menus = data.menus;
                    }
                    if (data.list.length == that.form.pagesize) {
                        that.can_scroll = true;
                    }
                    if (that.form.pageindex == 0) {
                        that.list = data.list;
                    } else {
                        that.list = that.list.concat(data.list);
                    }
                    app.current_item_length = that.list.length;
                    that.get_category = 0;
                    setTimeout(function() {
                        that.do_scroll_left();
                        that.reset_refresh_box();
                    }, 200);
                } else if (err) {
                    that.list = [];
                    that.current_item_length = 0;
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
        get_submenu: function() {
            var that = this;
            var options = {};
            options.action = 'gettaglistbycategoryid';
            options.categoryid = that.categoryid;
            ns.post(options, function(succeed, data, err) {
                that.is_searching = false;
                if (succeed) {
                    that.sub_menus = data.sub_menus;
                } else if (err) {
                    that.sub_menus = [];
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_scroll_left: function() {
            var that = this;
            var scroll_left = 0;
            var is_arrive = false;
            for (var i = 0; i < that.menus.length; i++) {
                var item = that.menus[i];
                item.is_active = false;
                if (item.id == that.categoryid) {
                    item.is_active = true;
                    document.getElementById('main_menus').scrollLeft = scroll_left;
                    is_arrive = true;
                    continue;
                }
                if (!is_arrive) {
                    var width = document.getElementById('label_' + item.id).offsetWidth;
                    scroll_left += width + 10;
                }
            }
        },
        search_sort: function(item) {
            var that = this;
            for (var i = 0; i < that.sortorders.length; i++) {
                that.sortorders[i].is_active = false;
            }
            item.is_active = true;
            that.current_sortby = item.index;
            that.get_data();
        },
        open_business: function(item) {
            var that = this;
            ns.openWin('business_frm', item.title, {
                title: item.title,
                url: 'business_frm.html',
                id: item.id,
                searchtype: 2
            });
        },
        do_search_top_menu: function(item) {
            var that = this;
            for (var i = 0; i < that.menus.length; i++) {
                that.menus[i].is_active = false;
            }
            item.is_active = true;
            that.categoryid = item.id;
            that.tagid = 0;
            that.form.pageindex = 0;
            that.get_data();
            that.get_submenu();
        },
        do_search_sub_menu: function(item) {
            var that = this;
            for (var i = 0; i < that.sub_menus.length; i++) {
                that.sub_menus[i].is_active = false;
            }
            item.is_active = true;
            that.tagid = item.id;
            that.form.keywords = '';
            that.get_data();
        },
        reset_refresh_box: function() {
            var that = this;
            var main_refresh = $api.byId('main_refresh');
            var top_menus = $api.byId('top_menus');
            var top_menus_h = $api.offset(top_menus).h;
            $api.css(main_refresh, 'margin-top:' + top_menus_h + 'px');
        }
    }
});
apiready = function() {
    api.parseTapmode();
    map = api.require('bMap');
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.categoryid = api.pageParam.id;
    app.type = api.pageParam.type || 0;
    app.form.issuggestion = (app.type.type == 15 ? 1 : 0);
    app.check_current_sort();
    app.get_data();
    app.get_submenu();
};
var pullRefresh = new auiPullToRefresh({
    container: document.querySelector('.aui-refresh-content'),
    triggerDistance: 100
}, function(ret) {
    if (ret.status == "success") {
        setTimeout(function() {
            app.form.pageindex = 0;
            app.get_data();
            pullRefresh.cancelLoading(); //刷新成功后调用此方法隐藏
        }, 1500)
    }
})
var scroll = new auiScroll({
    listen: true,
    distance: 0 //判断到达底部的距离，isToBottom为true
}, function(ret) {
    if (ret.isToBottom && app.can_scroll) {
        if (app.scroll_top > ret.scrollTop) {
            app.scroll_top = ret.scrollTop;
            return;
        }
        app.scroll_top = ret.scrollTop + 1;
        app.form.pageindex = app.current_item_length;
        app.get_data();
    }
});
