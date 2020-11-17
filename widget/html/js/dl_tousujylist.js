var ns;
var app = new Vue({
    el: '#app',
    data: {
        ServiceType: "2,3", //投诉建议
        IsSuggestion: 2, //投诉建议
        form: {
            pageindex: 0,
            pagesize: 10,
            keywords: '',
        },
        //投诉建议列表
        gongdanlist: []
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {};
            options.action = 'getnewservicelist';
            options.IsSuggestion = that.IsSuggestion; //投诉建议
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
        open_tousujydetail: function(item) {

            var that = this;
            ns.openWin('dl_tousujydetail_frm', '详情', {
                id: item.ID,
            });
        },
        do_open_addtousu: function(item) {
            var that = this;
            ns.openWin('dl_tousujyadd_frm', '新增投诉建议', {
                id: 0,
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    toast = new auiToast();
    app.get_data();
    api.addEventListener({
        name: 'reload_servicelist'
    }, function(ret, err) {
        app.get_data();
    });
};
