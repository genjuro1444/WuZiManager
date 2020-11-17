var ns, toast, map;
var app = new Vue({
    el: '#app',
    data: {
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
        open_wyjiaofei:function(item){
          var that = this;
          ns.openWin('dl_wyjiaofei_frm', '物业缴费',{
            id: 0,
          })
        },
        open_tousujylist:function(item){
          var that = this;
          ns.openWin('dl_tousujylist_frm', '投诉建议',{
            id: 0,
          })
        },
        open_bsbxlist:function(item){
          var that = this;
          ns.openWin('dl_bsbxlist_frm', '报事报修',{
            id: 0,
          })
        },
        open_fangkesq:function(item){
          var that = this;
          ns.openWin('dl_fangkesq_frm', '访客授权',{
            id: 0,
          })
        },
        open_tongzhigglist:function(item){
          var that = this;
          ns.openWin('dl_tongzhigglist_frm', '通知公告',{
            id: 0,
          })
        },
        open_wenjuandclist:function(item){
          var that = this;
          ns.openWin('dl_wenjuandclist_frm', '问卷调查',{
            id: 0,
          })
        },
        open_shequtplist:function(item){
          var that = this;
          ns.openWin('dl_shequtplist_frm', '社区投票',{
            id: 0,
          })
        },
        open_hujiaowy:function(item){
          var that = this;
          ns.openWin('dl_hujiaowy_frm', '呼叫物业',{
            id: 0,
          })
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
    // app.get_data();
    // app.get_submenu();
};
