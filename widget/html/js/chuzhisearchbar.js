var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            source: '',
            StartTime: '',
            EndTime: '',
            RepairStatus: 0
        },
        showbg: false,
        source: 'chuzhisearchbar_frm'
    },
    methods: {
        do_search: function() {
            var that = this;
            api.sendEvent({
                name: 'do_chuzhisearchbar_complete',
                extra: {
                    source: that.form.source,
                    StartTime: that.form.StartTime,
                    RepairStatus: that.form.RepairStatus,
                    EndTime: that.form.EndTime,
                }
            });
            setTimeout(function() {
                that.do_close();
            }, 100)
        },
        do_close: function() {
            var that = this;
            that.showbg = false;
            api.closeFrame();
        },
        do_reset: function() {
            var that = this;
            that.form.StartTime = '';
            that.form.EndTime = '';
            that.form.RepairStatus = 0;
        },
        do_select_date: function(type) {
            var that = this;
            var currentDate = '';
            if (type == 1) {
                currentDate = that.form.StartTime;
            } else {
                currentDate = that.form.EndTime;
            }
            api.openPicker({
                type: 'date',
                date: currentDate,
                title: '选择日期'
            }, function(ret, err) {
                if (ret) {
                    var year = ret.year;
                    var month = (ret.month >= 10 ? ret.month : '0' + ret.month);
                    var day = (ret.day >= 10 ? ret.day : '0' + ret.day);
                    currentDate = year + '-' + month + '-' + day;
                    if (type == 1) {
                        that.form.StartTime = currentDate;
                    } else {
                        that.form.EndTime = currentDate;
                    }
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.source = ns.getPageParam('source') || '';
    app.form.StartTime = ns.getPageParam('StartTime') || '';
    app.form.EndTime = ns.getPageParam('EndTime') || '';
    app.form.RepairStatus = ns.getPageParam('RepairStatus') || 0;
    app.showbg = true;
}
