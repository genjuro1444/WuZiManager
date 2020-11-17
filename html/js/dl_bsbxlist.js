var ns;
var app = new Vue({
    el: '#app',
    data: {
        ServiceType: "1", //报事报修
        IsSuggestion: 1, //报事报修
        form: {
            pageindex: 0,
            pagesize: 10,
            keywords: '',
        },
        //列表
        gongdanlist: []
    },
    methods: {

        get_data: function() {
            var that = this;
            var options = {};
            options.action = 'getnewservicelist';
            options.IsSuggestion = that.IsSuggestion; //
            options.pageindex = that.form.pageindex;
            options.pagesize = that.form.pagesize;
            options.keywords = that.form.keywords;
            options.ServiceType = that.ServiceType;
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.gongdanlist = data.gongdanlist;
                } else if (err) {

                }
            });
        },
        open_bsbxdetail: function(item) {
            var that = this;
            ns.openWin('dl_bsbxdetail_frm', '详情', {
                id: item.ID,
            });
        },
        do_open_add: function(item) {
            var that = this;
            ns.openWin('dl_bsbxadd_frm', '新增报事报修', {
                id: 0,
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_data();
    api.addEventListener({
        name: 'reload_servicelist'
    }, function(ret, err) {
        app.get_data();
    });
};
