var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        menus: [],
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'gethouseservicelist'
            }, function(succeed, data, err) {
                if (succeed) {
                    that.menus = data.menus;
                } else if (err) {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        open_wyjiaofei: function(item) {
            var that = this;
            ns.openWin('dl_wyjiaofei_frm', '物业缴费', {
                id: 0,
            })
        },
        open_tousujylist: function(item) {
            var that = this;
            ns.openWin('dl_tousujylist_frm', '投诉建议', {
                id: 0,
            })
        },
        open_bsbxlist: function(item) {
            var that = this;
            ns.openWin('dl_bsbxlist_frm', '报事报修', {
                id: 0,
            })
        },
        open_fangkesq: function(item) {
            var that = this;
            ns.openWin('dl_fangkesq_frm', '访客授权', {
                id: 0,
            })
        },
        open_tongzhigglist: function(item) {
            var that = this;
            ns.openWin('dl_tongzhigglist_frm', '通知公告', {
                id: 0,
            })
        },
        open_wenjuandclist: function(item) {
            var that = this;
            ns.openWin('dl_wenjuandclist_frm', '问卷调查', {
                id: 0,
            })
        },
        open_shequtplist: function(item) {
            var that = this;
            ns.openWin('dl_shequtplist_frm', '社区投票', {
                id: 0,
            })
        },
        open_hujiaowy: function(item) {
            var that = this;
            ns.openWin('dl_hujiaowy_frm', '呼叫物业', {
                id: 0,
            })
        },
        open_servicedetail: function(item) {
          var that = this;
          ns.openWin('dl_servicedetail_frm', item.title, {
              id: item.id,
          })
        },
    }
});
apiready = function() {
    api.parseTapmode();
    map = api.require('bMap');
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.get_data();
};
