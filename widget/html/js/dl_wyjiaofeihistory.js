var app;
app = new Vue({
    el: '#app',
    data: {
        form: {
            RoomID: 0
        },
        list: [],
        issearch: false
    },
    methods: {
        get_data: function() {
            var that = this;
            if (that.form.RoomID <= 0) {
                return;
            }
            that.issearch = true;
            ns.get({
                action: 'getroomfeehistorybyroomid',
                RoomID: that.form.RoomID
            }, function(succeed, data, err) {
                that.issearch = false;
                if (succeed) {
                    that.list = data;
                }
            });
        },
        show_morehistory: function(item) {
            item.ShowMore = !item.ShowMore;
        }
    }
});
app.get_data();
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.RoomID = api.pageParam.id || 0;
    app.get_data();
};
