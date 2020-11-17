var ns;
var app = new Vue({
    el: '#app',
    data: {
        ismoreshow: false,
        form: {
            ID: 0,
            imagelist: [],
            processlist: [],
        },
        task_imgList: [],
        total: false,
        isviewdetail: true,
        num: 6,
    },
    methods: {

        get_data: function() {
            var that = this;
            var options = {};
            options.ID = that.form.ID;
            options.action = "getnewservicedetail";
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.form;
                    that.task_imgList = data.form.imagelist;
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
        tel_phone: function(item) {
            ns.confirmPer('phone', function() {
                api.call({
                    type: 'tel_prompt',
                    number: item.phonenumber
                });
            });
        },
        img_browser: function(item) {
            var that = this;
            var imgurls = [];
            imgurls.push(item.imgurl);
            imageBrowser.openImages({
                imageUrls: imgurls,
                showList: false,
                activeIndex: 0
            });
        },
        open_bsbxpingjia: function() {
            var that = this;
            ns.openWin('dl_bsbxpingjia', '用户评价', {
                id: that.form.ID,
            });
        },
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    imageBrowser = api.require('imageBrowser');
    app.form.ID = api.pageParam.id || 0;
    toast = new auiToast();
    app.get_data();
};
